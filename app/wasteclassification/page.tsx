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

  const [openSensor, setOpenSensor] = useState(false);
  const [senserData, setSensorData] = useState(false);
  const [wasteCheck, setWasteCheck] = useState(false);
  

  // useEffect(() => {
  //   // เชื่อมต่อกับ Socket.IO Server
  //   const socket = io('http://127.0.0.1:3002');
  //   console.log(socket);
  //   // ฟัง event 'sensor' ที่ส่งจากเซิร์ฟเวอร์
    
  //   socket.on('sensor', (data) => {
  //     console.log('Received sensor data:', data);
  //     setSensorData(data); // อัปเดตค่า sensorData
  //     console.log('Sensor Data:', senserData);
  //   });
    
  //   // ส่งคำสั่งให้เซิร์ฟเวอร์ส่งค่า True
  //   socket.emit('send_true');

  //   // Clean up เมื่อ component ถูกลบออก
  //   return () => {
  //     socket.disconnect();
  //     console.log('Socket disconnected');
  //   };
  // }, [openSensor]);

  const sensorDetection = () => {
    // เชื่อมต่อกับ Socket.IO Server
    try {
    const socket =  io('http://192.168.1.121:3002');
    // console.log(socket);
    // ฟัง event 'sensor' ที่ส่งจากเซิร์ฟเวอร์
    
    socket.on('sensor', (data) => {
      // console.log('Received sensor data:', data);
      setSensorData(data); // อัปเดตค่า sensorData
      // console.log('Sensor Data1:', data);
      return data;
    });
    
    // ส่งคำสั่งให้เซิร์ฟเวอร์ส่งค่า True
    socket.emit('send_true');
    } catch (error) {
      return false;
    }

    // Clean up เมื่อ component ถูกลบออก
   

  };
  

  const openCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoInputDevices.length > 1) {
        const firstCameraId = videoInputDevices[1].deviceId;
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: firstCameraId } },
        });

        setStream(videoStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        startCapture();
      } else {
        alert("No camera found");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      alert("No camera found");
      router.push("/");
    }
  };

  useEffect(() => {
    const initCamera = async () => {
      try {
        const storedId = localStorage.getItem("userId"); // ดึงค่าจาก Local Storage
        console.log(storedId);
        if (storedId) {
          setUserid(storedId);
        } else {
          alert("Please Scan Your Face First");
          router.push("/");
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        if (videoInputDevices.length > 1) {
          const firstCameraId = videoInputDevices[1].deviceId;
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: firstCameraId } },
          });

          setStream(videoStream);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
          }
          
          startCapture();
        } else {
          console.log("No camera found");
          alert("No camera found");
          router.push("/");
        }
      } catch (error) {
        console.log(error);
        // router.push("/home");
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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
    openCamera();
    setErrorResult(false)
    setIsUploading(true)
    setFrameCount(0); // รีเซ็ตจำนวนภาพ
    setIsCapturing(true); // เริ่มถ่ายภาพ
  };

  
  const checkSensor = () => {
    return true;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    stopCamera();
    if (open) {
      setCountdown(10);
      
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (senserData != true) {
            sensorDetection();
          }
          if (prev === 1) {
            
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
 
  useEffect(() => {
    if (senserData === true) {
      // alert("Sensor Data: "+senserData)
      setCountdown(5)
    }
    
  }, [senserData])
  
  


  useEffect(() => {
    let timer: NodeJS.Timeout;
    stopCamera();
    if (errorResult) {
      setCountdown(5); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal
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

  const waitForVideoReady = async () => {
    const maxAttempts = 10; // จำนวนครั้งที่พยายามรอ
    let attempts = 0;
    while (videoRef.current && videoRef.current.readyState < 2 && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // รอ 100ms
      attempts++;
    }
    if (videoRef.current && videoRef.current.readyState < 2) {
      console.error("Video is not ready after multiple attempts");
      return false;
    }else {
      console.log("Video is ready")
      captureFrame();
      
    }
  }

  const captureFrame = async () => {

    if (!videoRef.current || videoRef.current.readyState < 2) {
        console.error("Video is not ready");
        waitForVideoReady();
        return;
        
      };
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth|| 640;
    canvas.height = videoRef.current.videoHeight || 480;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
        
      setIsUploading(true);
      try {

        const response = await fetch("http://192.168.1.121:8000/upload_frame/", {
          method: "POST",
          body: formData,
        });
        console.log(response);
        if (response != null) {
          const result = await response.json();
          setWaste(result.detected_class)
          setDocId(result.document_id)
          setWasteType(result.waste_type_detected)
          setWasteTypeId(result.waste_type_id)
          setDetectionImage(`data:image/jpeg;base64,${result.processed_image}`)
          setPoint(result.point)
          console.log(result);
          
          
          // setIsCapturing(false);
          
        }else{
          setErrorResult(true)
          setIsCapturing(false);
          return;
        };
        

        
      } catch (error) {
        console.error("Error uploading frame:", error);
        setWaste("Error uploading frame");
        setErrorResult(true)
      }
      setIsUploading(false)
      setOpen(true);
    }
    , "image/jpeg");
  };

  useEffect(() => {
    const saveWasteManagement = async () => {
      try {
        console.log("docId", docId)
        const response = await fetch("http://192.168.1.121:8000/saveWasteManagement/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: docId,
            garbage_type_sensor: true,
            user_id: userid,
            waste_type: wasteTypeId,
          }),
        });
  
        const result = await response.json();
  
        console.log(result);
        
        setWasteCheck(true);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (senserData === true) {
      saveWasteManagement();
    }
    
  }, [senserData]);
  
  
  useEffect(() => {
    const updatePoint = async () => {
      try {
  
        const response = await fetch("http://192.168.1.121:8000/updateUserPoint/", {
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
  
        console.log("Point : "+result);
       
        
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (senserData === true) {
      updatePoint();
      
    }
    
  }, [senserData])
  

  
  


  return (
    <div className="flex justify-center items-center min-h-screen">
      <video autoPlay muted loop id="myVideo">
            {/* <source src="./space-bg.mp4"></source> */}
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
              <p >Sensor Data : {senserData === null ? 'Waiting for data...' : senserData ? 'Success✅' : 'False❌'}</p>
              <p >Save Waste Data : {wasteCheck === null ? 'Waiting for data...' : wasteCheck ? 'Success✅' : 'False❌'}</p>
         
             
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button onClick={() => router.push('/')} variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={errorResult} onOpenChange={setErrorResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Result</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <DialogDescription>
              Error : <b>{waste}</b>
            </DialogDescription>
            <Button onClick={startCaptureAgain} variant="outline">Try Again</Button>
            <Button onClick={() => router.push('/')} variant="outline">Close In {countdown}</Button>
          </DialogHeader>
          
        </DialogContent>
      </Dialog>

      <Dialog open={openSensor} onOpenChange={setOpenSensor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sensor</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <DialogDescription>
              <p  style={{color:'#fff'}}>Sensor Data: {senserData === null ? 'Waiting for data...' : senserData ? 'True' : 'False'}</p>
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
