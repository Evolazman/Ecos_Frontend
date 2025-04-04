"use client";
import React from "react";
import "./globals.css";
import { useEffect , useState } from "react";
import { useRouter } from 'next/navigation'
import Video from "@/component/Video";
import io from 'socket.io-client';

export default function CameraStream() {
  const router = useRouter()
  useEffect(() => {
    return () => {
      localStorage.removeItem("userId"); // ลบข้อมูลเมื่อออกจากหน้า
      console.log("clear local storage success")
    };
  }, []);

  

  return (
    <div className="container-page">
      <video autoPlay muted playsInline loop id="myVideo">
        <source src="./space-bg-low.mp4"></source>
      </video>
      <div className="content">
        <img src="./logo-Ecos.png" style={{width : '25%'}}></img>
        <h1 style={{ zIndex:'10' , color :'#fff' , fontSize:"28px" , fontWeight:'600' , marginBottom:'10px' , marginTop :'-10px'}}>EcoCycle Solution</h1>
        <p style={{fontSize:'24px' , color:'#fff'}}>Welcome to <b style={{color :'#74C91B'}}>EcoCycle Solution</b> – AI-Powered Waste Management for Organizations</p>
        <p style={{color:'#fff'}}>At <b style={{color :'#74C91B'}}>ECOS</b>, we harness the power of AI to revolutionize waste management for businesses  and organizations.<br></br> 
         Our intelligent solutions help you optimize waste disposal, reduce environmental impact,
         <br></br>  and enhance sustainability efforts with real-time data and smart automation.</p>
        <button id="startWaste" onClick={() => router.push('/facerecognition')} style={{width : "200px" , zIndex :'10'}}>
            Start To Waste
        </button>
        
      </div>
    </div>
  );
}
