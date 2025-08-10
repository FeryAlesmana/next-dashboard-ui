"use client";
import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";



const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const CountChart = ({boys, girls}:{boys:number , girls:number}) => {
  const data = [
  {
    name: "Total",
    count: boys+girls,
    uv: 31.47,
    pv: 2400,
    fill: "white",
  },
  {
    name: "Boys",
    count: boys,
    uv: 31.47,
    pv: 2400,
    fill: "#c3ebfa",
  },
  {
    name: "Girls",
    count: girls,
    uv: 26.69,
    pv: 4567,
    fill: "#fae27c",
  },
];
  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      <Image
        src="/maleFemale.png"
        alt=""
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
      ></Image>
    </div>
  );
};

export default CountChart;
