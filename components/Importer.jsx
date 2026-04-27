"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUiStore } from "../Zustand/uiState";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [fileName, setFileName] = useState("");
  const [editedRows, setEditedRows] = useState(new Set());

  const { toggleControl } = useUiStore();

  // ================= FILE UPLOAD =================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (onLoading) onLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (!rows.length) throw new Error("Empty sheet");

      const extracted = rows
        .map((row, i) => {
          const normalized = Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
              k.toLowerCase().trim(),
              v,
            ])
          );

          const lat = parseFloat(normalized.latitude ?? normalized.lat);
          const lng = parseFloat(
            normalized.longitude ?? normalized.lon ?? normalized.lng
          );

          const nameKeys = [
            "ihs site id",
            "site id",
            "site_id",
            "siteid",
            "id",
            "name",
          ];

          let name =
            nameKeys.map((k) => normalized[k]).find(Boolean) ||
            `Point ${i + 1}`;

          if (typeof name === "string") name = name.trim().toUpperCase();

          if (
            isNaN(lat) ||
            isNaN(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          )
            return null;

          return { name, lat, lng };
        })
        .filter(Boolean);

      if (!extracted.length)
        throw new Error("No valid coordinates found");

      setPreviewData(extracted.slice(0, 200)); // limit preview
      setSuccess(`Showing ${Math.min(200, extracted.length)} of ${extracted.length} points`);
    } catch (err) {
      console.error(err);
      setError("Failed to read file. Ensure valid Latitude & Longitude.");
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  // ================= EDIT =================
  const handleEditRow = (index, field, value) => {
    setPreviewData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );

    setEditedRows((prev) => new Set(prev).add(index));
  };

  const handleRemoveRow = (index) => {
    setPreviewData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPreview = () => {
    setPreviewData([]);
    setSuccess(null);
    setError(null);
    setEditedRows(new Set());
  };

  // ================= CONFIRM =================
  const handleConfirmImport = () => {
    if (!previewData.length) return;

    setConfirmLoading(true);

    setTimeout(() => {
      onImport(previewData);
      setSuccess(`${previewData.length} points added to map`);
      setPreviewData([]);
      setEditedRows(new Set());
      setShowConfirm(false);
      setConfirmLoading(false);
      setShowImporter(false);
    }, 500);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-black/30 relative backdrop-blur-md rounded-2xl border border-white/10 text-white w-[90vw] sm:max-w-md shadow-xl"
      >
        {/* Close */}
        <button
          onClick={() => toggleControl("importer")}
          className="absolute right-5 top-5"
        >
          <X size={18} color="red" />
        </button>

        <h3 className="text-lg font-bold mb-2 text-amber-400">
          📄 Import Coordinates
        </h3>

        {/* Upload */}
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-amber-500/50 rounded-xl cursor-pointer hover:bg-amber-500/10">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <span className="text-sm">
            Drag & drop or click to upload
          </span>
        </label>

   

        {/* Status */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.p className="text-yellow-400 text-center mt-2">
              Reading file...
            </motion.p>
          )}
          {error && (
            <motion.p className="text-red-400 text-center mt-2">
              {error}
            </motion.p>
          )}
          {previewData.length > 0 && (
  <p className="text-xl text-center mt-2 text-emerald-400">
    {previewData.length} active points
  </p>
)}
        </AnimatePresence>

        {/* TABLE */}
        {previewData.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto border border-white/10 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-gray-800 text-amber-400 sticky top-0">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Lat</th>
                  <th className="p-2">Lng</th>
                  <th className="p-2">❌</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((p, i) => (
                  <tr
                    key={i}
                    className={`border-b ${
                      editedRows.has(i)
                        ? "bg-amber-500/10"
                        : "hover:bg-gray-700/60"
                    }`}
                  >
                    <td className="p-2">
                      <input
                        value={p.name}
                        onChange={(e) =>
                          handleEditRow(i, "name", e.target.value)
                        }
                        className="bg-transparent border border-white/10 px-2 py-1 rounded w-full"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        value={p.lat}
                        onChange={(e) =>
                          handleEditRow(
                            i,
                            "lat",
                            parseFloat(e.target.value)
                          )
                        }
                        className="bg-transparent border border-white/10 px-2 py-1 rounded w-full"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        value={p.lng}
                        onChange={(e) =>
                          handleEditRow(
                            i,
                            "lng",
                            parseFloat(e.target.value)
                          )
                        }
                        className="bg-transparent border border-white/10 px-2 py-1 rounded w-full"
                      />
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => handleRemoveRow(i)}
                        className="hover:text-red-400"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ACTIONS */}
        {previewData.length > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleClearPreview}
              className="w-full bg-red-700 hover:bg-red-600 py-2 rounded-xl text-xs"
            >
              Clear
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-green-700 hover:bg-green-600 py-2 rounded-xl text-xs"
            >
              Continue
            </button>
          </div>
        )}
      </motion.div>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div className="bg-gray-900 p-6 rounded-2xl w-[90vw] max-w-sm border border-white/10">
              <h3 className="text-xl text-center font-bold text-white mb-2">
                Confirm Import
              </h3>

              <p className="text-sm mb-4">
               
                <span className="text-gray-400 text-xs text-center font-semibold">
                 Import {previewData.length} points to map?
                </span>
                
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full bg-red-700 text-white py-2 rounded-xl"
                >
                  No, Cancel
                </button>

                <button
                  onClick={handleConfirmImport}
                  disabled={confirmLoading}
                  className="w-full bg-green-600 text-white py-2 rounded-xl"
                >
                  {confirmLoading ? "Importing..." : "Yes, Import"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}