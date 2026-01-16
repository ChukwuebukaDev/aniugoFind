import { useState } from "react";
import * as XLSX from "xlsx";

type ExtractedRow = {
  siteId: string;
  accessRef: string;
  ihsNumber: string;
  ihsName: string;
};

export default function ExcelSiteImporter() {
  const [data, setData] = useState<ExtractedRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const binary = evt.target?.result;
        const workbook = XLSX.read(binary, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          defval: "",
        });

        const extracted: ExtractedRow[] = json.map((row) => ({
          siteId: row["IHS Site ID"] ?? "",
          accessRef: row["SAR Reference Number"] ?? "",
          ihsNumber: row["IHS FSE Mobile"] ?? "",
          ihsName: row["IHS FSE Name"] ?? "",
        }));

        setData(extracted);
        setError(null);
      } catch (err) {
        setError("Failed to read Excel file");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-4 z-[1000] bg-black fixed bottom-10 left-0 rounded-2xl p-1">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="block"
      />

      {error && <p className="text-red-500">{error}</p>}

      {data.length > 0 && (
        <div className="border rounded-lg max-h-[320px] overflow-hidden">
          <div className="overflow-auto max-h-[320px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left">Site ID</th>
                  <th className="p-2 text-left">Access Ref</th>
                  <th className="p-2 text-left">IHS Number</th>
                  <th className="p-2 text-left">IHS Name</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-2">{row.siteId}</td>
                    <td className="p-2">{row.accessRef}</td>
                    <td className="p-2">{row.ihsNumber}</td>
                    <td className="p-2">{row.ihsName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
