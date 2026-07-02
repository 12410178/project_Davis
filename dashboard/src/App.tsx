import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import { askGemini } from "./api/gemini";

import {
  Line,
  Bar,
  Pie,
  Scatter
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showAI, setShowAI] = useState(false);


  const [selectedProvince, setSelectedProvince] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [schoolData, setSchoolData] = useState<any[]>([]);

  useEffect(() => {
    async function loadExcel() {
      try {
        console.log("Mulai membaca Excel");
  
        const response = await fetch("/Pendidikan.xlsx");
        console.log("Status:", response.status);
  
        const buffer = await response.arrayBuffer();
  
        console.log("Buffer size:", buffer.byteLength);
  
        console.log("Mulai baca workbook...");

        const workbook = XLSX.read(new Uint8Array(buffer), {
          type: "array",
        });

        console.log("Workbook berhasil");

        console.log("Sheet:", workbook.SheetNames);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
        console.log("Jumlah Data:", jsonData.length);
        console.log("Data pertama:", jsonData[0]);
        console.log(Object.keys(jsonData[0] as object));
  
        setSchoolData(jsonData);
  
      } 
      catch (error) {
        console.error("ERROR LENGKAP:", error);
      }
    }
  
    loadExcel();
  }, []);
  
  console.log("Jumlah data:", schoolData.length);
  console.log(
    [...new Set(schoolData.map((x: any) => x.status))]
  );
  console.log(
    [...new Set(schoolData.map((x:any)=>x.stage))]
  );
  console.log(
    "Provinsi:",
    [...new Set(schoolData.map((x:any)=>x.province_name))].length
  );

  const askAI = async () => {
    try {
  
      const prompt = `
      Anda adalah AI Data Analyst untuk Dashboard Analisis Persebaran Pendidikan Indonesia.

      Gunakan HANYA data berikut untuk menjawab pertanyaan pengguna.

      === RINGKASAN DASHBOARD ===

      Total Sekolah : ${filteredData.length}

      Jumlah Provinsi : ${new Set(filteredData.map((x:any)=>x.province_name)).size}

      Populasi Penduduk Usia Sekolah : ${educationPopulation.toLocaleString()}

      Sekolah Negeri : ${filteredData.filter((x:any)=>x.status==="N").length}

      Sekolah Swasta : ${filteredData.filter((x:any)=>x.status==="S").length}

      === PERSEBARAN SEKOLAH PER PROVINSI (LINE CHART) ===
      ${provinceCount
      .map((x)=>`${x.province}: ${x.total} sekolah`)
      .join("\n")}

      === JUMLAH SEKOLAH BERDASARKAN JENJANG (BAR CHART) ===

      SD : ${filteredData.filter((x:any)=>x.stage==="SD").length}
      SMP : ${filteredData.filter((x:any)=>x.stage==="SMP").length}
      SMA : ${filteredData.filter((x:any)=>x.stage==="SMA").length}
      SMK : ${filteredData.filter((x:any)=>x.stage==="SMK").length}
      SLB : ${filteredData.filter((x:any)=>x.stage==="SLB").length}
      SDLB : ${filteredData.filter((x:any)=>x.stage==="SDLB").length}
      SMPLB : ${filteredData.filter((x:any)=>x.stage==="SMPLB").length}
      SMLB : ${filteredData.filter((x:any)=>x.stage==="SMLB").length}

      === PERBANDINGAN STATUS SEKOLAH (PIE CHART) ===

      Negeri : ${filteredData.filter((x:any)=>x.status==="N").length}

      Swasta : ${filteredData.filter((x:any)=>x.status==="S").length}

      === HUBUNGAN JUMLAH PENDUDUK DAN JUMLAH SEKOLAH (SCATTER CHART) ===

      ${scatterProvince
      .map((x)=>`${x.province}: Penduduk ${x.x}, Sekolah ${x.y}`)
      .join("\n")}

      === PETUNJUK ===

      Jawablah pertanyaan berdasarkan seluruh data dashboard di atas.

      Anda dapat menjawab mengenai:
      - insight utama dashboard
      - provinsi dengan sekolah terbanyak
      - provinsi dengan sekolah paling sedikit
      - persebaran sekolah antar provinsi
      - distribusi jenjang pendidikan
      - perbandingan sekolah negeri dan swasta
      - hubungan jumlah penduduk dengan jumlah sekolah
      - penjelasan line chart
      - penjelasan bar chart
      - penjelasan pie chart
      - penjelasan scatter chart
      - kesimpulan dashboard

      Penting:
      - Line chart menunjukkan persebaran jumlah sekolah antar provinsi, BUKAN tren waktu.
      - Jangan mengatakan data tidak tersedia apabila informasi sudah ada pada dashboard.
      - Berikan jawaban singkat, jelas, maksimal 5 kalimat.

      Pertanyaan pengguna:
      ${question}
      `;
  
      const result = await askGemini(prompt);

      setAnswer(result || "");

      } catch (err: any) {
        console.error("Gemini Error:", err);

        setAnswer(
          err?.message ||
          JSON.stringify(err, null, 2) ||
          "Terjadi kesalahan."
        );
      }
  };

  const provinces = [
    "All",
    ...new Set(
      schoolData
        .map((item: any) => item.province_name)
        .filter(Boolean)
    )
  ];

  const filteredData = schoolData.filter((item: any) => {
    return (
      (selectedProvince === "All" ||
        String(item.province_name).toUpperCase() ===
        selectedProvince.toUpperCase()) &&
  
      (selectedStage === "All" ||
        item.stage === selectedStage) &&
  
      (selectedStatus === "All" ||
        item.status === selectedStatus)
    );
  });
  console.log("Province :", selectedProvince);
  console.log("Stage :", selectedStage);
  console.log("Status :", selectedStatus);
  console.log("Filtered :", filteredData.length);

  const provinceCount = provinces
  .filter((p) => p !== "All")
  .map((province) => ({
    province,
    total: filteredData.filter(
      (x: any) => x.province_name === province
    ).length,
  }))
  .sort((a, b) => b.total - a.total);

  const lineData = {
    labels: provinceCount.map((x) => x.province),
    datasets: [
      {
        label: "Jumlah Sekolah",
        data: provinceCount.map((x) => x.total),
        borderColor: "#ff4d4d",
        backgroundColor: "#ff4d4d",
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: [
      "SD",
      "SMP",
      "SMA",
      "SMK",
      "SLB",
      "SDLB",
      "SMPLB",
      "SMLB"
    ],
    datasets: [
      {
        label: "Jumlah Sekolah",
        data: [
          filteredData.filter((x:any)=>x.stage==="SD").length,
          filteredData.filter((x:any)=>x.stage==="SMP").length,
          filteredData.filter((x:any)=>x.stage==="SMA").length,
          filteredData.filter((x:any)=>x.stage==="SMK").length,
          filteredData.filter((x:any)=>x.stage==="SLB").length,
          filteredData.filter((x:any)=>x.stage==="SDLB").length,
          filteredData.filter((x:any)=>x.stage==="SMPLB").length,
          filteredData.filter((x:any)=>x.stage==="SMLB").length,
        ],
        backgroundColor: [
          "#ff3b3b",
          "#ff6b6b",
          "#ff8787",
          "#2563eb",
          "#60a5fa"
        ]
      }
    ]
  };

  const pieData = {
    labels: ["Negeri", "Swasta"],
    datasets: [
      {
        data: [
          filteredData.filter((x:any)=>x.status==="N").length,
          filteredData.filter((x:any)=>x.status==="S").length,
        ],
        backgroundColor: [
          "#ff4d4d",
          "#3b82f6"
        ]
      }
    ]
  };

  const educationPopulation = (() => {

    if (selectedProvince !== "All") {
      return filteredData.length > 0
        ? Number(filteredData[0].total_education_age_population) || 0
        : 0;
    }
  
    const uniqueProvince = [
      ...new Map(
        schoolData.map((item: any) => [
          item.province_name,
          Number(item.total_education_age_population) || 0
        ])
      ).values()
    ];
  
    return uniqueProvince.reduce((a, b) => a + b, 0);
  
  })();

  const scatterProvince = provinceCount.map((item) => {

    const first = filteredData.find(
      (x:any) => x.province_name === item.province
    );
  
    return {
      x: Number(first?.total_population || 0),
      y: item.total,
      province: item.province,
    };
  
  }).filter(x => x.x > 0);

  const scatterData = {
    datasets: [
      {
        label: "Jumlah Sekolah vs Populasi",
        data: scatterProvince,
        backgroundColor: "#ff4d6d",
        pointRadius: 7,
      },
    ],
  };
  const scatterOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context:any){
            return (
              context.raw.province +
              " | Populasi: " +
              context.raw.x.toLocaleString() +
              " | Sekolah: " +
              context.raw.y.toLocaleString()
            );
          }
        }
      }
    },
  
    scales:{
      x:{
        title:{
          display:true,
          text:"Jumlah Penduduk"
        }
      },
      y:{
        title:{
          display:true,
          text:"Jumlah Sekolah"
        }
      }
    }
  }

  return (
    <div className="container">

      <div className="header">
        <h1>
          Dashboard Analisis Persebaran Pendidikan Indonesia
        </h1>

        <p>
          AI Integrated Web-Based Data Analytics Dashboard
        </p>
      </div>

      <div className="filter">

      <select
        value={selectedProvince}
        onChange={(e) => setSelectedProvince(e.target.value)}
      >
        <option value="All">Province Name</option>

        {provinces
          .filter((p) => p !== "All")
          .map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={selectedStage}
        onChange={(e) => setSelectedStage(e.target.value)}
      >
        <option value="All">Stage</option>
        <option value="SD">SD</option>
        <option value="SMP">SMP</option>
        <option value="SMA">SMA</option>
        <option value="SMK">SMK</option>
        <option value="SLB">SLB</option>
        <option value="SDLB">SDLB</option>
        <option value="SMPLB">SMPLB</option>
        <option value="SMLB">SMLB</option>
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="All">Status</option>
        <option value="N">Negeri</option>
        <option value="S">Swasta</option>
      </select>

      </div>

      <div className="cards">

        <div className="card">
          <h3>Total Sekolah</h3>
          <h1>{filteredData.length.toLocaleString()}</h1>
        </div>

        <div className="card">
          <h3>Total Provinsi</h3>
          <h1>
            {
              new Set(filteredData.map((x: any) => x.province_name)).size
            }
          </h1>
        </div>

        <div className="card">
          <h3>Populasi Penduduk Usia Sekolah</h3>
          <h1>{educationPopulation.toLocaleString()}</h1>
        </div>

        <div className="card">
          <h3>Sekolah Negeri</h3>
          <h1>
          {
            filteredData.filter((x:any)=>x.status==="N").length.toLocaleString()
          }
          </h1>
        </div>

        <div className="card">
          <h3>Sekolah Swasta</h3>
          <h1>
          {
            filteredData.filter((x:any)=>x.status==="S").length.toLocaleString()
          }
          </h1>
        </div>

      </div>

      <div className="row">

        <div className="chart">
          <h2>Persebaran Sekolah</h2>
          <Line data={lineData} />
        </div>

        <div className="chart">
          <h2>Jenjang Pendidikan</h2>
          <Bar data={barData} />
        </div>

      </div>

      <div className="row">

        <div className="chart pie">
          <h2>Negeri vs Swasta</h2>
          <Pie data={pieData} />
        </div>

        <div className="chart">
          <h2>Korelasi Wilayah</h2>
          <Scatter
            data={scatterData}
            options={scatterOptions}
          />
        </div>

      </div>

      <div className="insight">

        <h2>Insight Dashboard</h2>

        <p>
          Struktur pendidikan Indonesia menunjukkan ketimpangan
          spasial. Pulau Jawa memiliki jumlah sekolah yang jauh
          lebih tinggi dibanding wilayah lainnya.
        </p>

      </div>

      <div
        className="chat-float"
        onClick={() => setShowAI(!showAI)}
      >
        🤖
      </div>

      {showAI && (

      <div className="chat-window">

          <div className="chat-header">

              <span>🤖 AI Assistant</span>

              <button onClick={() => setShowAI(false)}>
                  ✕
              </button>

          </div>

          <div className="chat-body">

              <div className="bot-message">
                  Halo 👋<br/>
                  Saya siap membantu menganalisis dashboard pendidikan.
              </div>

              {answer && (
                  <div className="bot-message">
                      {answer}
                  </div>
              )}

          </div>

          <div className="chat-input">

              <input
                  value={question}
                  onChange={(e)=>setQuestion(e.target.value)}
                  placeholder="Tanyakan sesuatu..."
              />

              <button onClick={askAI}>
                  Kirim
              </button>

          </div>

      </div>

)}

</div>
);
}

export default App;