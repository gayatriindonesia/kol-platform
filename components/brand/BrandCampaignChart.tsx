"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MonthlyData {
  month: string;
  brands: number;
  campaigns: number;
}

export default function BrandCampaignChart({ data }: { data: MonthlyData[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Bulan: ${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
        <Bar dataKey="brands" name="Brands" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="campaigns" name="Campaigns" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
