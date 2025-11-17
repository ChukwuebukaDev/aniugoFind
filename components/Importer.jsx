import { useState } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";

export default function ExcelCoordinateImporter({
  onImport,
  setShowImporter,
  onLoading,
}) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setLoading(true); // local loading
    if (onLoading) onLoading(true); // parent callback

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      const extractedPoints = rows
        .map((row, i) => {
          const normalized = Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v])
          );

          const lat = parseFloat(normalized.latitude ?? normalized.lat);
          const lng = parseFloat(
            normalized.longitude ?? normalized.lon ?? normalized.lng
          );

          let name =
            normalized["ihs site id"] ??
            normalized["site id"] ??
            normalized.name ??
            `Point ${i + 1}`;
          if (typeof name === "string") name = name.trim().toUpperCase();

          if (isNaN(lat) || isNaN(lng)) return null;
          return { name, lat, lng };
        })
        .filter(Boolean);

      if (extractedPoints.length === 0)
        throw new Error("No valid coordinates found.");

      setPreviewData(extractedPoints);
      setSuccess(`Found ${extractedPoints.length} points.`);
    } catch (err) {
      console.error(err);
      setError("Failed to read the file. Ensure it has Latitude & Longitude.");
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false); // notify parent
    }
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) return;

    setConfirmLoading(true); // start spinner

    // simulate small delay for UX or heavy processing
    setTimeout(() => {
      onImport(previewData);
      setSuccess(`${previewData.length} points added to map.`);
      setPreviewData([]);
      setShowImporter(false);
      setConfirmLoading(false); // stop spinner
    }, 500);
  };

  const handleClearPreview = () => {
    setPreviewData([]);
    setSuccess(null);
    setError(null);
  };

  const handleRemoveRow = (index) => {
    setPreviewData((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 text-white w-[90vw] sm:max-w-md shadow-xl "
    >
      <h3 className="text-lg font-bold mb-2 text-amber-400">
        📄 Import Coordinates from Excel
      </h3>

      <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-amber-500/50 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-all">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={handleFileUpload}
        />
        <span className="text-sm opacity-90">
          Drag & drop or click to upload (.xlsx / .csv)
        </span>
      </label>

      {/* Status Feedback */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-3 text-yellow-400"
          >
            Reading file...
          </motion.p>
        )}
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm mt-3 text-center"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-green-400 text-sm mt-3 text-center"
          >
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 🧭 Preview Table */}
      {previewData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 overflow-y-auto max-h-60 border border-white/10 rounded-xl"
        >
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-800/80 text-amber-400 sticky top-0">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Latitude</th>
                <th className="p-2">Longitude</th>
                <th className="p-2 text-center">❌</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((p, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-700/60 border-b border-gray-700"
                >
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.lat.toFixed(6)}</td>
                  <td className="p-2">{p.lng.toFixed(6)}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveRow(i)}
                      className="hover:text-red-400 transition-all"
                      title="Remove this row"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Action Buttons */}
      {previewData.length > 0 && (
        <div className="flex justify-between mt-4 gap-3">
          <button
            onClick={handleClearPreview}
            className="bg-red-700 hover:bg-red-600 px-3 py-2 rounded-xl text-xs font-semibold"
          >
            Clear
          </button>
          <button
            onClick={handleConfirmImport}
            className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded-xl text-xs font-semibold"
          >
            {confirmLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            Confirm Import
          </button>
        </div>
      )}
    </motion.div>
  );
}
