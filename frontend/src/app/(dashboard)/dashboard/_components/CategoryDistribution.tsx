"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDistributionProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: [
          "rgba(99, 102, 241, 0.6)", // Indigo
          "rgba(168, 85, 247, 0.6)", // Purple
          "rgba(236, 72, 153, 0.6)", // Pink
          "rgba(244, 63, 94, 0.6)", // Rose
          "rgba(249, 115, 22, 0.6)", // Orange
          "rgba(234, 179, 8, 0.6)", // Yellow
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(244, 63, 94, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(234, 179, 8, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: { size: 10, weight: "bold" as const },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: "70%",
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
