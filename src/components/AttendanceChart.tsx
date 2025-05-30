"use client";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Image from 'next/image';

const data = [
  {
    name: 'Senin',
    present: 40,
    absent: 20,
  },
  {
    name: 'Selasa',
    present: 30,
    absent: 18,
  },
  {
    name: 'Rabu',
    present: 20,
    absent: 90,
  },
  {
    name: 'Kamis',
    present: 20,
    absent: 38,
  },
  {
    name: "Jum'at",
    present: 10,
    absent: 40,
  },
  {
    name: 'Sabtu',
    present: 20,
    absent: 30,
  },
  {
    name: 'Minggu',
    present: 30,
    absent: 40,
  },
];

const AttendanceChart = () => {
  return (
    <div className='bg-white rounded-lg p-4 h-full'>
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold'>Kehadiran</h1>
        <Image src='/moreDark.png' alt='' width={20} height={20}></Image>
      </div>
        
       <ResponsiveContainer width="100%" height="90%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd'/>
          <XAxis dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
          <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
          <Tooltip contentStyle={{borderRadius:"10px", borderColor:"lightgray"}}/>
          <Legend align='left' verticalAlign='top' wrapperStyle={{paddingTop:"20px",paddingBottom:"40px"}}/>
          <Bar dataKey="present" fill="#fae27c"  legendType="circle" radius={[5,5,0,0]}/>
          <Bar dataKey="absent" fill="#c3ebfa" legendType="circle" radius={[5,5,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AttendanceChart