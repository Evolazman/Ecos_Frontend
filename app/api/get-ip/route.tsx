// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   const forwarded = req.headers.get("x-forwarded-for");
//   let ip = forwarded ? forwarded.split(",")[0] : req.headers.get("host");
//   // เช็คค่า IP ที่รับมา
//   console.log("Forwarded IP:", forwarded);
//   console.log("Host Header:", req.headers.get("host"));

//   // ถ้า IP เป็น "::1" ให้แปลงเป็น "127.0.0.1"
//   if (!ip || ip === "::1") {
//     ip = "127.0.0.1";
//   }
//   ip = ip.replace(/[^0-9.]/g, "");

//   console.log("Final IP Address:", ip);
//   return NextResponse.json({ ip });
// }
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  let  ip = realIP === "::1" ? "127.0.0.1" : realIP;
  ip = ip.replace(/[^0-9.]/g, "");

  return NextResponse.json({ ip });
}
