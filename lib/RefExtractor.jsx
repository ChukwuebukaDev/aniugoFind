"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { X, FileSpreadsheet } from "lucide-react";
import { usePointsStore } from "../Zustand/MapStateManager";
import { motion } from "framer-motion";

export default function ExcelCompareImporter() {
  const points = usePointsStore((s) => s.points);

  const [isOpen, setIsOpen] = useState(false); // closed by default on mobile
  const [matchedRows, setMatchedRows] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const pointNamesSet = new Set(
          points.map((p) => p.name?.trim().toLowerCase()),
        );

        const matched = json.filter((row) =>
          pointNamesSet.has(
            String(row["IHS Site ID"] ?? "")
              .trim()
              .toLowerCase(),
          ),
        );

        setMatchedRows(matched);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Invalid Excel file or missing required columns");
        setMatchedRows([]);
      }
    };

    reader.readAsBinaryString(file);
    e.currentTarget.value = "";
  };

  return (
    <>
      {/* Animated toggle button for mobile */}
      {!isOpen && points.length > 1 && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed top-50 left-0 z-[1000] flex items-center gap-2 rounded-r-full bg-emerald-700 px-4 py-2 text-white shadow-lg hover:bg-emerald-600 md:hidden"
        >
          <FileSpreadsheet size={18} />
          <span className="text-sm font-medium">Extract Access Ref</span>
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        drag={window.innerWidth >= 768 ? "x" : false} // draggable only on desktop
        dragConstraints={{ left: 0, right: 0 }}
        initial={{ x: window.innerWidth < 768 ? "100%" : 0 }}
        animate={{ x: isOpen ? 0 : window.innerWidth < 768 ? "100%" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 z-[999] h-full w-[90%] max-w-[450px] bg-emerald-700 p-4 text-white shadow-xl md:max-w-[500px]`}
      >
        {/* Header */}
        <header className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Matched Excel Data</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-emerald-600"
          >
            <X size={18} />
          </button>
        </header>

        <p className="text-sm opacity-80 mb-3">
          {matchedRows.length} matched / {points.length} points
        </p>

        {/* File Upload */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="mb-3 w-full rounded border border-emerald-600 px-2 py-1 text-black text-sm"
        />

        {error && <p className="text-sm text-red-300 mb-2">{error}</p>}

        {/* Matched Table */}
        {matchedRows.length > 0 ? (
          <div className="overflow-auto rounded border border-emerald-500 bg-white text-black shadow-sm max-h-[80vh]">
            <table className="min-w-full text-left text-sm md:text-base">
              <thead className="sticky top-0 bg-emerald-600 text-white">
                <tr>
                  <th className="p-2 font-medium">IHS Site ID</th>
                  <th className="p-2 font-medium">SAR Reference</th>
                  <th className="p-2 font-medium">FSE Name</th>
                  <th className="p-2 font-medium">FSE Mobile</th>
                </tr>
              </thead>
              <tbody>
                {matchedRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-2">{row["IHS Site ID"]}</td>
                    <td className="p-2">{row["SAR Reference Number"]}</td>
                    <td className="p-2">{row["IHS FSE Name"]}</td>
                    <td className="p-2">{row["IHS FSE Mobile"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-200 mt-2">No matching rows found.</p>
        )}
      </motion.div>
    </>
  );
}
