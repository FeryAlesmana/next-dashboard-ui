import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <div className="h-screen flex p-4">
      {/*LEFT*/}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%]" >
        <Link href= "/" className="flex items-center justify-center gap-2 lg:justify-start"> 
        <Image src="/logo.png" alt="logo" width={32} height={32}></Image>
        <span className="hidden lg:block font-bold">SMP Islamiyah</span>
        </Link>
        <Menu></Menu>
        </div>
      {/*RIGHT*/}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar></Navbar>
        {children}
      </div>
    </div>
    
  );
}