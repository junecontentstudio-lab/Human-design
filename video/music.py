import numpy as np, wave
SR=48000; DUR=20.0; N=int(SR*DUR); rng=np.random.default_rng(11)
L=np.zeros(N); R=np.zeros(N)
def hz(n):  # nom de note -> fréquence
    names={'C':0,'C#':1,'Db':1,'D':2,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'Ab':8,'A':9,'Bb':10,'B':11}
    nm, o = n[:-1], int(n[-1]); return 440*2**((names[nm]+12*(o+1)-69)/12)
def add(sig, start, pan=0.0, gain=1.0):
    i=int(start*SR); j=min(N, i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt(0.5*(1-pan)); R[i:j]+=s*np.sqrt(0.5*(1+pan))
def piano(n, vel=.5, dur=3.2):
    f=hz(n); t=np.arange(int(dur*SR))/SR; s=np.zeros_like(t)
    for k in range(1,8):
        fk=f*k*np.sqrt(1+0.0004*k*k)
        if fk>9000: break
        s+=np.sin(2*np.pi*fk*t+rng.random()*6)*(1/k**1.7)*np.exp(-t*(0.9+0.55*k)*(1+f/1400))
    att=1-np.exp(-t/0.006); felt=rng.normal(0,1,len(t))*np.exp(-t/0.004)*0.04
    s=(s*att+felt)*vel; return s*np.minimum(1,(dur-t)/0.3)
def pad(notes, dur, vel=.06, atk=1.4, rel=1.6):
    t=np.arange(int(dur*SR))/SR; s=np.zeros_like(t)
    for n in notes:
        f=hz(n)
        for d in (-0.004,0,0.0045): s+=np.sin(2*np.pi*f*(1+d)*t+rng.random()*6)+0.18*np.sin(4*np.pi*f*(1+d)*t)
    env=np.minimum(1,t/atk)*np.minimum(1,np.maximum(0,(dur-t)/rel)); trem=1+0.06*np.sin(2*np.pi*0.25*t)
    return s*env*trem*vel/len(notes)
def lowpass(x, fc):
    a=np.exp(-2*np.pi*np.asarray(fc)/SR); y=np.zeros_like(x); prev=0.0
    if np.ndim(a)==0: a=np.full(len(x),a)
    for i in range(len(x)): prev=(1-a[i])*x[i]+a[i]*prev; y[i]=prev
    return y
def whoosh(dur=.75, peak=.45, f0=300, f1=4500, vel=.35):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.normal(0,1,n); p=t/dur
    fc=f0+(f1-f0)*np.sin(np.pi*np.minimum(1,p/ (2*peak)))**2
    env=np.where(p<peak,(p/peak)**2,np.exp(-(p-peak)*7)); y=lowpass(x,fc)-lowpass(x,fc*0.15)
    return y*env*vel
def bell(n, vel=.18, dur=3.0):
    f=hz(n); t=np.arange(int(dur*SR))/SR
    s=sum(np.sin(2*np.pi*f*r*t)*a*np.exp(-t*d) for r,a,d in [(1,1,1.4),(2.76,.45,2.6),(5.4,.25,4),(8.9,.12,6)])
    return s*(1-np.exp(-t/0.002))*vel
# --- A. nuit : bourdon + notes isolées
t=np.arange(int(3.6*SR))/SR
drone=(np.sin(2*np.pi*hz('F1')*t)+.5*np.sin(2*np.pi*hz('C2')*t)+.25*np.sin(2*np.pi*hz('F2')*t))*np.minimum(1,t/1.2)*np.minimum(1,(3.6-t)/0.8)*0.10
add(drone,0)
for n,st,v,pn in [('F3',.35,.42,-.2),('C4',1.0,.36,.15),('A4',1.38,.34,-.1),('E5',2.05,.26,.25),('G5',2.5,.18,-.25)]: add(piano(n,v,3.5),st,pn)
add(whoosh(.8,.55,250,5000,.32),2.7,0)
# --- B. charte : Fmaj9 puis Dm9, arpèges en croches
add(pad(['F3','A3','C4','E4','G4'],2.9,.07),3.1,-.15); add(pad(['F2'],2.9,.05),3.1)
add(pad(['D3','F3','A3','C4','E4'],2.9,.07),5.6,.15); add(pad(['D2'],2.9,.05),5.6)
arpB=['F4','A4','C5','E5','G5','E5','C5','A4']; arpD=['D4','F4','A4','C5','E5','C5','A4','F4']
st=3.4; i=0
while st<8.1:
    seq=arpB if st<5.6 else arpD; n=seq[i%8]; add(piano(n,.20+.06*(i%4==0),2.4),st,-.3+.6*((i%8)/7)); st+=0.4; i+=1
add(bell('C6',.05,2.5),4.7,.3)  # tracé des canaux
add(bell('A5',.06,2.8),6.3,-.3)  # centres qui se colorent
# --- C. quiz : Bbmaj7, transition et tap
add(whoosh(.6,.5,400,6000,.28),8.0,.1)
add(pad(['Bb2','D3','F3','A3','C4'],2.7,.07),8.2,0); add(pad(['Bb1'],2.7,.05),8.2)
arpBb=['Bb3','D4','F4','A4','C5','A4','F4','D4']; st=8.4; i=0
while st<10.7: add(piano(arpBb[i%8],.18+.06*(i%4==0),2.2),st,-.3+.6*((i%8)/7)); st+=0.4; i+=1
for k,s0 in enumerate([9.0,9.13,9.26,9.39,9.52,9.65]): add(bell(['F6','A6','C7','G6','E6','C6'][k],.025,.6),s0,(-1)**k*.5)
click=rng.normal(0,1,int(.03*SR))*np.exp(-np.arange(int(.03*SR))/SR/0.004); add(lowpass(click,2500)*.5,10.25); add(piano('C6',.22,1.2),10.27,0)
# --- montée puis impact
n=int(1.3*SR); t=np.arange(n)/SR; p=t/1.3
riser=(lowpass(rng.normal(0,1,n),300+6000*p**2)*.5+np.sin(2*np.pi*(180*t+500*t*t/1.3))*.25)*p**2.2*.5
add(riser,10.5)
n=int(2.4*SR); t=np.arange(n)/SR; f=45+45*np.exp(-t*6); boom=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.9)*.55
boom+=lowpass(rng.normal(0,1,n),900)*np.exp(-t*9)*.5; add(boom,11.8)
for n_,d,pn in [('F6',0,-.4),('A6',.06,.4),('C7',.12,-.2),('F7',.2,.25)]: add(bell(n_,.07,3.2),11.82+d,pn)
# --- D. révélation : Fmaj7 ample, mélodie, notes des cartes
add(pad(['F2','C3','A3','E4','G4','C5'],3.6,.085,.6,1.4),11.8,0); add(pad(['F1'],3.6,.05,.6),11.8)
add(pad(['Bb2','F3','A3','D4','C5'],1.9,.075,.5,1.2),15.0,0)
for n_,st_,v in [('A5',12.2,.30),('G5',12.85,.26),('F5',13.4,.26)]: add(piano(n_,v,3.2),st_,.1)
for n_,st_ in [('A4',13.55),('C5',13.85),('F5',14.15)]: add(piano(n_,.30,2.4),st_,-.2); add(bell(n_[:-1]+str(int(n_[-1])+1),.03,1.2),st_+.02,.3)
for n_,st_ in [('E5',14.8),('C5',15.2),('D5',15.6)]: add(piano(n_,.2,2.4),st_,.2)
add(whoosh(.7,.5,300,5000,.3),16.0,0)
# --- E. signature : sus puis résolution
add(pad(['C3','F3','G3','C4'],1.4,.07,.4,.6),16.4,0)
add(pad(['F2','C3','F3','A3','G4','C5'],3.6,.085,.5,1.4),17.3,0); add(pad(['F1'],3.6,.05,.5),17.3)
for n_,st_ in [('F4',17.35),('A4',17.55),('C5',17.75),('G5',17.95)]: add(piano(n_,.24,2.6),st_,-.2+.15*(st_-17.35)*4)
add(bell('F6',.08,2.6),17.85,0); add(bell('C7',.05,2.4),17.9,.3)
# --- réverbération (convolution FFT)
irn=int(2.8*SR); tt=np.arange(irn)/SR; irL=rng.normal(0,1,irn)*np.exp(-tt*2.3); irR=rng.normal(0,1,irn)*np.exp(-tt*2.3)
irL=lowpass(irL,5000); irR=lowpass(irR,5000); irL/=np.sqrt((irL**2).sum()); irR/=np.sqrt((irR**2).sum())
def conv(x,h):
    m=len(x)+len(h); M=1<<(m-1).bit_length(); return np.fft.irfft(np.fft.rfft(x,M)*np.fft.rfft(h,M),M)[:len(x)]
wL=conv(L,irL); wR=conv(R,irR); L2=L*.78+wL*.42; R2=R*.78+wR*.42
# --- master : fondu, limiteur doux, normalisation
t=np.arange(N)/SR; fade=np.minimum(1,np.maximum(0,(DUR-t)/1.0)); fade=np.minimum(fade,np.minimum(1,t/0.05))
L2*=fade; R2*=fade; pk=max(np.abs(L2).max(),np.abs(R2).max()); L2/=pk; R2/=pk
L2=np.tanh(L2*1.6)/np.tanh(1.6)*0.89; R2=np.tanh(R2*1.6)/np.tanh(1.6)*0.89
data=(np.stack([L2,R2],1)*32767).astype('<i2')
with wave.open('music.wav','wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print('ok rms dB', 20*np.log10(np.sqrt((L2**2).mean())))
