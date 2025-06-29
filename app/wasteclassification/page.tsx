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
  const [openAlertSuccess, setOpenAlertSuccess] = useState(false);
  const [sensorData, setSensorData] = useState(false);
  const [sensorDataTrigger, setSensorDataTrigger] = useState(false);
  const [uploadWaste, setUploadWaste] = useState(false);
  const [wasteCheck, setWasteCheck] = useState(false);
  
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    const res = await fetch('http://192.168.1.121:8000/send-fixed-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userid  // คุณจะ set ค่านี้เอง
      })
    })

    const data = await res.json()
    if (res.ok) {
      setMessage('✅ Email sent successfully')
    } else {
      setMessage('❌ Failed: ' + data.detail)
    }
  }

  const handlePointsDeducted = async () => {
    console.log("User Id Check", userid)

    const response = await fetch("http://192.168.1.121:8000/updateUserPointDeducted/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id : userid,
        deducted_point : point,
      }),
    });

    const result = await response.json();
    console.log("Point : "+result);
  }

  const [ip, setIp] = useState("Loading...");

  useEffect(() => {
    fetch("/api/get-ip")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => setIp("Error fetching IP"));
  }, []);
  
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

  const updatePoint = async () => {

    console.log("User Id Check", userid)
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
  }

  const sensorDetection = () => {
    // เชื่อมต่อกับ Socket.IO Server

    const socket = io(`http://${ip}:3002`, {
      transports: ['websocket'], // ป้องกัน fallback polling ที่ไม่จำเป็น
    });

    // const socket = io(`http://192.168.1.161:3002`, {
    //   transports: ['websocket'], // ป้องกัน fallback polling ที่ไม่จำเป็น
    // });
  
    // ฟัง event จาก server
    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
  
      // ส่งคำสั่งให้ server เริ่มส่งข้อมูล sensor
      socket.emit("get_sensor" , wasteType);
      
    });
  
    socket.on("sensor", (data) => {
      console.log("📡 Received sensor data:", data);
      setSensorData(data);
      setSensorDataTrigger(true);
    });
  
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  
    // ทำลาย socket เมื่อตัว component ถูก unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log("🧹 Socket connection closed.");
      }
    };
  };
  
  const hasDetected = useRef(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let hasSent = false;
    let cleanupSocket: () => void; // ใช้เก็บฟังก์ชัน cleanup
  
    stopCamera();
  
    if (open) {
      setCountdown(10);
  
      if (!hasDetected.current) {
        cleanupSocket = sensorDetection(); // 🔁 เก็บฟังก์ชัน cleanup
        hasDetected.current = true;
      }
  
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1 && !hasSent) {
            hasSent = true;
  
            // ✅ cleanup socket ก่อนเปลี่ยนหน้า
            if (cleanupSocket) {
              cleanupSocket();
              
            }

            if (countdown === 1) {
              router.push('/');
            }
            
            clearInterval(timer);
            return 0;
          }
  
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      clearInterval(timer);
      // ⚠️ ยังไม่ cleanup socket ที่นี่ เพราะต้องการ cleanup หลัง push
    };
  }, [open]);

  useEffect(() => {
    if (sensorDataTrigger) {  // เช็คว่า sensor มาจริง
      saveWasteManagement();
  
      if (sensorData === false) {
        handleSend();
      } else if (sensorData === true) {
        updatePoint();
        setOpenAlertSuccess(true);
      }
      setTimeout(function() {
        router.push('/');
      }, 5000); // หน่วงเวลา 2000 มิลลิวินาที (2 วินาที)
      
    }
  }, [sensorDataTrigger]);
  
  const handleClose = () => {
    let cleanupSocket: () => void; // ใช้เก็บฟังก์ชัน cleanup
    cleanupSocket = sensorDetection(); // 🔁 เก็บฟังก์ชัน cleanup
    
    if (sensorData == false) {
      handleSend();
      saveWasteManagement();
    }else if (sensorData == true) {
      updatePoint();
      saveWasteManagement();
    }

    if (cleanupSocket) {
      cleanupSocket();
    }
    router.push('/')
}
  
 
  useEffect(() => {
    if (sensorData === true) {
      // alert("Sensor Data: "+senserData)
      setCountdown(5)
    }
    
  }, [sensorDataTrigger])
  
  


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
          setUploadWaste(true)
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

  const saveWasteManagement = async () => {
    try {
      // console.log("docId", docId)
      const response = await fetch("http://192.168.1.121:8000/saveWasteManagement/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: docId,
          garbage_type_sensor: sensorData,
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
  
  
  // useEffect(() => {
  //   const updatePoint = async () => {
  //     try {
  //       console.log("User Id Check", userid)
  //       const response = await fetch("http://192.168.1.121:8000/updateUserPoint/", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           user_id : userid,
  //           additional_point : point,
  //         }),
  //       });
  
  //       const result = await response.json();
  
  //       console.log("Point : "+result);
       
        
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };
  //   if (sensorData === true) {
  //     updatePoint();
  //   }
    
  // }, [sensorDataTrigger])
  

  
  


  return (
    <div className="flex justify-center items-center min-h-screen">
      <video autoPlay muted loop id="myVideo">
            {/* <source src="./space-bg.mp4"></source> */}
        </video>
      <video  ref={videoRef} autoPlay playsInline className="w-full max-w-[750px] border-3 z-10 rounded-xl" />

      <Dialog  modal open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-auto max-h-[90vh] overflow-y-auto" >
          <DialogHeader >
            <DialogTitle>Result</DialogTitle>
            <div className="flex flex-row ">
              <img  src={detectionImage} className="w-[40%] rounded-b-md mr-10" />
              <DialogDescription>
                <p className="text-lg font-bold">Waste Classification Result</p>
                <br />
                <div className="bg-[#f8f8f8] p-4 rounded-md shadow-md w-full">
                Your waste type : <b className="text-red-500 font-bold text-lg ">{wasteType}</b>
                <br />
      
                Your waste : <b>{waste}</b>
                <br />
                 <div className="text-xs">Your waste type id: <b>{wasteTypeId}</b></div>
                </div>
                 <br />
                <p className="text-lg font-bold">Waste Management Information</p>
                <br />
                User Id : <b>{userid}</b>
                {/* <br /> */}
                {/* Document ID : <b>{docId}</b> */}
                
                <br />
                Points received : <b>{point}</b>
                <br />
                <br />
                <p className="text-lg font-bold">Sensor Detection Status</p>
                <p >Sensor Data : {sensorData === null ? 'Waiting for data...' : sensorData ? 'Success✅' : 'False❌'}</p>
                <p >Save Waste Data : {wasteCheck === null ? 'Waiting for data...' : wasteCheck ? 'Success✅' : 'False❌'}</p>
                <br />
                {/* IP Address : <b style={{ fontSize: 24 }}>{ip}</b> */}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="h-20"  onClick={handleClose} variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog modal open={errorResult} onOpenChange={setErrorResult}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Result</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <DialogDescription>
              Error : <b>{waste}</b>
            </DialogDescription>
            <Button className="h-10"  onClick={startCaptureAgain} variant="outline">Try Again</Button>
            <Button className="h-10"  onClick={() => router.push('/')} variant="outline">Close In {countdown}</Button>
          </DialogHeader>
          
        </DialogContent>
      </Dialog>

      <Dialog modal open={openSensor} onOpenChange={setOpenSensor}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sensor</DialogTitle>
            <img src={detectionImage} style={{width : '100%'}} />
            <DialogDescription>
              <p  style={{color:'#fff'}}>Sensor Data: {sensorData === null ? 'Waiting for data...' : sensorData ? 'True' : 'False'}</p>
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="h-20"  onClick={() => router.push('/')} variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog modal open={openAlertSuccess} onOpenChange={setOpenAlertSuccess}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl text-[#74C91B]">Alert Success</DialogTitle>
            <DialogDescription>
              <p className="text-center text-2xl" style={{color:'#74C91B'}}>ขอบคุณที่ทิ้งขยะถูกถังค่ะ</p>
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            {/* <Button className="h-20"  onClick={() => router.push('/')} variant="outline">Close in {countdown}</Button> */}
          </DialogClose>
        </DialogContent>
      </Dialog>

    </div>
  );
}
