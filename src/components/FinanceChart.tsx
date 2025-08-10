"use client";
import Image from "next/image";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    pemasukan: 4000,
    pengeluaran: 2400,
  },
  {
    name: 'Feb',
    pemasukan: 3000,
    pengeluaran: 1398,
  },
  {
    name: 'Mar',
    pemasukan: 2000,
    pengeluaran: 9800,
  },
  {
    name: 'Apr',
    pemasukan: 2780,
    pengeluaran: 3908,
  },
  {
    name: 'Mei',
    pemasukan: 1890,
    pengeluaran: 4800,
  },
  {
    name: 'Jun',
    pemasukan: 2390,
    pengeluaran: 3800,
  },
  {
    name: 'Jul',
    pemasukan: 3490,
    pengeluaran: 4300,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
         {/* TITLE */}
        <div className='flex items-center justify-between'>
            <h1 className='text-lg font-semibold'>Finance</h1>
            <Image src="/moreDark.png" alt='' width={20} height={20}></Image>
        </div>
        <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke='#ddd'/>
          <XAxis dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
          <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false} tickMargin={20}/>
          <Tooltip />
          <Legend align='center' verticalAlign='top' wrapperStyle={{paddingTop:"10px",paddingBottom:"30px"}}/>
          <Line type="monotone" dataKey="pemasukan" stroke="#8884d8" strokeWidth={5} />
          <Line type="monotone" dataKey="pengeluaran" stroke="#82ca9d" strokeWidth={5}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FinanceChart