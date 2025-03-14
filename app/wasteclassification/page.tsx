"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import "../globals.css";
import { useRouter } from 'next/navigation'
import io from 'socket.io-client';

export default function CameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detectionImage, setDetectionImage] = useState<string | undefined>(undefined);

  const [waste, setWaste] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [docId, setDocId] = useState("");
  const [wasteTypeId, setWasteTypeId] = useState("");
  const [userid , setUserid] = useState("");

  const maxFrames = 1; // กำหนดให้ถ่าย 20 ครั้ง
  const [frameCount, setFrameCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [point , setPoint] = useState(0)

  const [countdown, setCountdown] = useState(0);
  const [errorResult, setErrorResult] = useState(false);
  const [sensor, setSensor] = useState(false);

  const SOCKET_SERVER_URL = "http://192.168.1.161:3002";
  const socket = io(SOCKET_SERVER_URL, { transports: ["websocket", "polling"] });


  useEffect(() => {
    try {
      const storedId = localStorage.getItem("userId"); // ดึงค่าจาก Local Storage
        console.log(storedId)
        if (storedId) {
          setUserid(storedId);
        }else{
          router.push('/')
      }
      navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((videoStream) => {
        setStream(videoStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        
        
        startCapture()
      })
      .catch((error) => router.push('/home'));
    } catch (error) {
      console.log(error)
    }
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);

    }
  };

  useEffect(() => {
    if (isCapturing == false) {
      return;
    }
    if (frameCount >= maxFrames) {
      setOpen(true);
      return;
    }; // หยุดเมื่อถึง 20 ภาพ

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

  const saveWasteManagement = async (docid:any , waste_type_id:any) => {
    try {
      console.log("docId", docId)
      const response = await fetch("https://192.168.1.121:8000/saveWasteManagement/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: docid,
          garbage_type_sensor: true,
          user_id: userid,
          waste_type: waste_type_id,
        }),
      });

      const result = await response.json();

      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  
  const updatePoint = async (point:any) => {
    try {
      const response = await fetch("https://192.168.1.121:8000/updateUserPoint/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id : userid,
          additional_point : point,
        }),
      });

      const result = await response.json();

      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  
  const checkSensor = () => {
    return true;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    stopCamera();
    if (open) {
      setCountdown(5); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            var sensor = checkSensor();
            if (sensor == true) {
              
            }else{
              alert("Please put the waste in the correct place")
            }
            setOpen(false); // ปิด Modal เมื่อถึง 0
            router.push('/')
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer); // เคลียร์ interval เมื่อปิด Modal
  }, [open]);

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

        const response = await fetch("https://192.168.1.121:8000/upload_frame/", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setWaste(result.detected_class)
        setDocId(result.document_id)
        setWasteType(result.waste_type_detected)
        setWasteTypeId(result.waste_type_id)
        setDetectionImage(`data:image/jpeg;base64,${result.processed_image}`)
        setPoint(result.point)
        console.log(result);
        saveWasteManagement(result.document_id , result.waste_type_id );
        updatePoint(result.point);
        
        console.log(socket.id)
        
      } catch (error) {
        console.error("Error uploading frame:", error);
        setWaste("Error uploading frame");
      }
      setIsUploading(false)
    }
    , "image/jpeg");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <video autoPlay muted loop id="myVideo">
            <source src="./space-bg.mp4"></source>
        </video>
      <video  ref={videoRef} autoPlay playsInline className="w-full max-w-[700px] border-3 z-10 rounded-xl" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Result</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <DialogDescription>
              User Id : <b>{userid}</b>
              <br />
              Document ID : <b>{docId}</b>
              <br />
              Your waste type : <b>{wasteType}</b>
              <br />
              Your waste type id: <b>{wasteTypeId}</b>
              <br />
              Your waste : <b>{waste}</b>
              <br />
              Points received : <b>{point}</b>
              <br />
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button onClick={() => router.push('/')} variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      
    </div>
  );
}
