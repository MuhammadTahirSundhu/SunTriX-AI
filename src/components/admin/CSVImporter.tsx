import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Check, X, ChevronRight, AlertCircle, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

export interface ExpectedField {
  key: string;
  label: string;
  required?: boolean;
}

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => Promise<void>;
  expectedFields: ExpectedField[];
  moduleName: string;
}

export function CSVImporter({ isOpen, onClose, onImport, expectedFields, moduleName }: CSVImporterProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map, 3: Preview
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  
  // Maps ExpectedField.key -> CSV Header string
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          toast.error("CSV file appears to be empty or missing headers");
          return;
        }
        setCsvHeaders(results.meta.fields);
        setCsvData(results.data);
        
        // Auto-map fields based on exact or similar names (case-insensitive)
        const initialMapping: Record<string, string> = {};
        const lowerHeaders = results.meta.fields.map(h => h.toLowerCase());
        
        expectedFields.forEach(field => {
          const matchIndex = lowerHeaders.findIndex(h => 
            h === field.key.toLowerCase() || h === field.label.toLowerCase()
          );
          if (matchIndex !== -1) {
            initialMapping[field.key] = results.meta.fields![matchIndex];
          }
        });
        
        setFieldMapping(initialMapping);
        setStep(2);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (fileInputRef.current) {
        // We can't directly set FileList, but we can call our handler logic
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
        handleFileUpload({ target: fileInputRef.current } as any);
      }
    }
  };

  const resetState = () => {
    setStep(1);
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleMappingNext = () => {
    // Check required fields
    const missingRequired = expectedFields.filter(f => f.required && !fieldMapping[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Missing required mappings: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }
    setStep(3);
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    // Transform data using mapping
    const mappedItems = csvData.map(row => {
      const item: any = {};
      expectedFields.forEach(field => {
        const csvCol = fieldMapping[field.key];
        if (csvCol && row[csvCol] !== undefined) {
          item[field.key] = row[csvCol];
        }
      });
      return item;
    });

    try {
      await onImport(mappedItems);
      toast.success(`Successfully imported ${mappedItems.length} items!`);
      handleClose();
    } catch (error) {
      toast.error("Failed to import items");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = expectedFields.map(f => f.key);
    const csv = Papa.unparse({
      fields: headers,
      data: []
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${moduleName.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Import {moduleName}</h2>
              <p className="text-xs text-muted-foreground">Upload a CSV to bulk create items</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-muted-foreground">CSV files only (max 5MB)</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="text-sm text-foreground">
                    <span className="font-medium">Need a template?</span> Download a pre-formatted CSV file.
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="text-sm font-medium text-primary hover:underline px-3 py-1.5"
                >
                  Download Template
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-lg flex gap-3 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Map your CSV columns to the required {moduleName} fields. We've auto-mapped columns with matching names.</p>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted border-b border-border font-medium text-sm text-muted-foreground">
                  <div>{moduleName} Field</div>
                  <div>CSV Column</div>
                </div>
                <div className="divide-y divide-border">
                  {expectedFields.map(field => (
                    <div key={field.key} className="grid grid-cols-2 gap-4 p-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{field.label}</span>
                        {field.required && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Required</span>}
                      </div>
                      <select 
                        className="w-full text-sm rounded-md border border-border bg-background px-3 py-2"
                        value={fieldMapping[field.key] || ""}
                        onChange={(e) => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      >
                        <option value="">-- Do not map --</option>
                        {csvHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-muted/50 rounded-xl border border-border">
                <div className="inline-flex h-16 w-16 bg-primary/20 text-primary items-center justify-center rounded-full mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Import</h3>
                <p className="text-muted-foreground">
                  You are about to import <span className="font-bold text-foreground">{csvData.length}</span> items into {moduleName}.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted/30 flex justify-between items-center">
          {step === 1 ? (
            <div /> // empty placeholder for flex alignment
          ) : (
            <button 
              onClick={() => setStep(step === 2 ? 1 : 2)} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2"
            >
              Back
            </button>
          )}

          {step === 2 && (
            <button 
              onClick={handleMappingNext}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {step === 3 && (
            <button 
              onClick={handleImport}
              disabled={isImporting}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isImporting ? "Importing..." : "Start Import"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
