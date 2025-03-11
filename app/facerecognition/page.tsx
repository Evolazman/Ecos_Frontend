"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import "../globals.css";
import { useRouter } from 'next/navigation'

const page = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [detectionImage, setDetectionImage] = useState<string | undefined>(undefined);
    const [name, setName] = useState("Your Result!!!");
  
    const maxFrames = 1; // กำหนดให้ถ่าย 20 ครั้ง
    const [frameCount, setFrameCount] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const router = useRouter()
    // modal
    const [open, setOpen] = useState(false);
    const [errorResult, setErrorResult] = useState(false);
    const [cameraError, setCameraError] = useState(false);

    const [point , setPoint] = useState(20)
    const [userid , setUserid] = useState('')
    const [countdown, setCountdown] = useState(10);
    const [countdownbackhome, setCountdownbackhome] = useState(5);
    const [back, setBack] = useState(false);
    
    
    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA
    useEffect(() => {
      try {
        navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((videoStream) => {
          setStream(videoStream);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
          }
          startCapture()
        })
        .catch((error) => console.log(error));
      } catch (error) {
        setCameraError(true)
        setBack(true)
        console.log(stream)
        // alert("Error : Can't Open Camera." + error)
        // router.push('/');
      }
      return () => {
        stopCamera();
      };
    }, []);
    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA    //OPEN CAMERA

    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
  
      }
    };
    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA    //STOP CAMERA
  
    //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED 
    useEffect(() => {
      if (stream == null) {
        return;
      }
      if (isCapturing == false) {
        return;
      }
      if (frameCount >= maxFrames) {
        return;
      };
  
      const interval = setInterval(() => {
        captureFrame();
        setFrameCount(prev => prev + 1);
      }, 500); // ถ่ายทุกๆ 500ms
      return () => clearInterval(interval);
    }, [isCapturing, frameCount]); // เรียกซ้ำเมื่อ frameCount เปลี่ยน
  

    const startCapture = () => {
      setIsUploading(true)
      setFrameCount(0); // รีเซ็ตจำนวนภาพ
      setIsCapturing(true); // เริ่มถ่ายภาพ
    };

    const startCaptureAgain = () => {
      setErrorResult(false)
      setIsUploading(true)
      setFrameCount(0); // รีเซ็ตจำนวนภาพ
      setIsCapturing(true); // เริ่มถ่ายภาพ
    };
    //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED     //START FACEDETECTED 

    //OPEN MODAL     //OPEN MODAL    //OPEN MODAL    //OPEN MODAL    //OPEN MODAL     //OPEN MODAL    //OPEN MODAL    //OPEN MODAL

    useEffect(() => {
      let timer: NodeJS.Timeout;
      stopCamera();
      if (open) {
        setCountdown(10); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal
  
        timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              setOpen(false); // ปิด Modal เมื่อถึง 0
              router.push('/wasteclassification')
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
  
      return () => clearInterval(timer); // เคลียร์ interval เมื่อปิด Modal
    }, [open]);

    //OPEN MODAL     //OPEN MODAL    //OPEN MODAL    //OPEN MODAL    //OPEN MODAL     //OPEN MODAL    //OPEN MODAL    //OPEN MODAL

    //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (errorResult) {
        setCountdown(10); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal
  
        timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              setErrorResult(false); // ปิด Modal เมื่อถึง 0
              router.push('/')
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
  
      return () => clearInterval(timer); // เคลียร์ interval เมื่อปิด Modal
    }, [errorResult]);
  
    //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     //OPEN MODAL ERROR     
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (back) {
        setCountdownbackhome(5); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal
  
        timer = setInterval(() => {
          setCountdownbackhome((prev) => {
            if (prev === 1) {
              setErrorResult(false); // ปิด Modal เมื่อถึง 0
              clearInterval(timer);
              setCountdownbackhome(0)
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
  
      return () => clearInterval(timer); // เคลียร์ interval เมื่อปิด Modal
    }, [back]);

    useEffect(() =>{
      if (countdownbackhome == 0 ) {
        router.push('/')
      }
    },[countdownbackhome])



    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL
    const captureFrame = async () => {
  
      if (!videoRef.current) return;
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
  
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
      canvas.toBlob(async (blob) => {
        
        if (!blob) return;
  
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");
          
        setIsUploading(true);
        try {
          const response = await fetch("https://192.168.1.121:8000/upload_face/", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          
          if (result.processed_image == "No face detected!") {
            console.log("No face detected! result")
            setErrorResult(true);
            return;
          }
          else {
            setUserid(result.user_id_identified)
            console.log(result.user_id_identified)
            localStorage.setItem("userId", result.user_id_identified); // เก็บค่าไว้
            setName(result.detected_class)
            setDetectionImage(`data:image/jpeg;base64,${result.processed_image}`)
            console.log(result);
            setOpen(true);
            return "face detected!";
          }
          
          // setTimeout(() => {
          //     stopCamera();
          //   }, 5000);
  
          
        } catch (error) {
          console.error("Error uploading frame:", error);
          setName("Error uploading frame");
        }
        setIsUploading(false)
      }
      , "image/jpeg");
    };
    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL    //API CALL
  return (
    <div className="flex justify-center items-center min-h-screen">
        <video autoPlay muted loop id="myVideo">
            <source src="./space-bg.mp4"></source>
        </video>
        <video  ref={videoRef} autoPlay playsInline className="w-full max-w-[700px] border-3 z-10 rounded-xl" />

        {/* modal */}
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Result</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <br />
            <DialogDescription>
              User Id : <b>{userid}</b>
            </DialogDescription>
            <DialogDescription style={{textAlign:'center'}}>
              <br />
              <br />
              
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button onClick={() => router.push('/wasteclassification')} variant="outline"> <b style={{color:'#ff4545' , fontSize:'16px' , textAlign:'center' ,fontWeight:'500'}}>Please put away the garbage.</b>Start in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={errorResult} onOpenChange={setErrorResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              No Face detected!!!
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={startCaptureAgain}>Detect faces again</Button>
          <Button variant="outline" onClick={() => router.push('wasteclassification')}>Start Waste classification</Button>
          <DialogClose asChild>
            <Button onClick={() => router.push('/')} variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={cameraError} onOpenChange={setCameraError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Camera can't open. Pless try again...
            </DialogDescription>
          </DialogHeader>
          
          <DialogClose asChild>
            <Button onClick={() => router.push('/')} variant="outline">Close {countdownbackhome}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

    </div>

    
  
  )
}

export default page