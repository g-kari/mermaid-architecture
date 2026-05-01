import { useEffect, useState } from "react";
import { canvasDataToDrawio, downloadDrawio } from "../../lib/drawio-generator";
import { canvasDataToMarkdown, downloadMarkdown } from "../../lib/markdown-generator";
import { canvasDataToMermaid } from "../../lib/mermaid-generator";
import { downloadPng, downloadSvg, exportPng, exportSvg } from "../../lib/svg-exporter";
import { canvasDataToTerraform, downloadTerraform } from "../../lib/terraform-generator";
import { useCanvasStore } from "../../stores/canvas";

type ExportTab = "mermaid" | "svg" | "png" | "drawio" | "markdown" | "terraform";

const TABS: { key: ExportTab; label: string }[] = [
  { key: "mermaid", label: "Mermaid" },
  { key: "svg", label: "SVG" },
  { key: "png", label: "PNG" },
  { key: "drawio", label: "draw.io" },
  { key: "markdown", label: "Markdown" },
  { key: "terraform", label: "Terraform" },
];

function getSvgElement(): SVGSVGElement | null {
  return document.getElementById("canvas-svg") as SVGSVGElement | null;
}

export default function ExportButton() {
  const data = useCanvasStore((s) => s.data);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ExportTab>("mermaid");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowModal((prev) => !prev);
    window.addEventListener("toggle-export", handleToggle);
    return () => window.removeEventListener("toggle-export", handleToggle);
  }, []);

  const mermaidCode = canvasDataToMermaid(data);
  const markdownCode = canvasDataToMarkdown(data);
  const terraformCode = canvasDataToTerraform(data);

  const copyMermaid = async () => {
    await navigator.clipboard.writeText(mermaidCode);
  };

  const downloadMmd = () => {
    const blob = new Blob([mermaidCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "architecture.mmd";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSvgDownload = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    setExporting(true);
    try {
      const svgString = await exportSvg(svg, data);
      downloadSvg(svgString);
    } finally {
      setExporting(false);
    }
  };

  const handlePngDownload = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    setExporting(true);
    try {
      const pngBlob = await exportPng(svg, data);
      downloadPng(pngBlob);
    } finally {
      setExporting(false);
    }
  };

  const handleDrawioDownload = () => {
    const xml = canvasDataToDrawio(data);
    downloadDrawio(xml);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "mermaid":
        return (
          <>
            <pre className="flex-1 overflow-auto p-4 text-sm text-text-secondary font-mono whitespace-pre">
              {mermaidCode}
            </pre>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={copyMermaid}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium"
              >
                クリップボードにコピー
              </button>
              <button
                onClick={downloadMmd}
                className="bg-bg-hover hover:bg-bg px-4 py-2 rounded-md text-sm font-medium"
              >
                .mmd ダウンロード
              </button>
            </div>
          </>
        );

      case "svg":
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-text-secondary text-sm">
              現在のキャンバスをSVGファイルとしてエクスポートします。
            </p>
            <button
              onClick={handleSvgDownload}
              disabled={exporting}
              className="bg-accent hover:bg-accent-hover text-accent-text px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {exporting ? "変換中..." : "SVG ダウンロード"}
            </button>
          </div>
        );

      case "png":
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-text-secondary text-sm">
              現在のキャンバスをPNG画像（2倍解像度）としてエクスポートします。
            </p>
            <button
              onClick={handlePngDownload}
              disabled={exporting}
              className="bg-accent hover:bg-accent-hover text-accent-text px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {exporting ? "変換中..." : "PNG ダウンロード"}
            </button>
          </div>
        );

      case "drawio":
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-text-secondary text-sm">
              draw.io（diagrams.net）で開けるXMLファイルとしてエクスポートします。
            </p>
            <button
              onClick={handleDrawioDownload}
              className="bg-accent hover:bg-accent-hover text-accent-text px-6 py-2 rounded-md text-sm font-medium"
            >
              .drawio ダウンロード
            </button>
          </div>
        );

      case "markdown":
        return (
          <>
            <pre className="flex-1 overflow-auto p-4 text-sm text-text-secondary font-mono whitespace-pre-wrap">
              {markdownCode}
            </pre>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(markdownCode);
                }}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium"
              >
                クリップボードにコピー
              </button>
              <button
                onClick={() => downloadMarkdown(markdownCode)}
                className="bg-bg-hover hover:bg-bg px-4 py-2 rounded-md text-sm font-medium"
              >
                .md ダウンロード
              </button>
            </div>
          </>
        );

      case "terraform":
        return (
          <>
            <pre className="flex-1 overflow-auto p-4 text-sm text-text-secondary font-mono whitespace-pre">
              {terraformCode}
            </pre>
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(terraformCode);
                }}
                className="bg-accent hover:bg-accent-hover text-accent-text px-4 py-2 rounded-md text-sm font-medium"
              >
                クリップボードにコピー
              </button>
              <button
                onClick={() => downloadTerraform(terraformCode)}
                className="bg-bg-hover hover:bg-bg px-4 py-2 rounded-md text-sm font-medium"
              >
                .tf ダウンロード
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm bg-bg-hover hover:bg-bg-hover px-3 py-1 rounded-md transition-colors"
      >
        エクスポート
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div className="bg-bg-panel rounded-lg border border-border w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium">エクスポート</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text"
              >
                &times;
              </button>
            </div>

            <div className="flex border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-accent border-b-2 border-accent"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">{renderTabContent()}</div>
          </div>
        </div>
      )}
    </>
  );
}
