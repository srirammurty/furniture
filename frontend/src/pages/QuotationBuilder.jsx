import React, { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { Plus, Trash2, FileDown, Upload, GripVertical, X, Edit2, Check, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { defaultItems } from "../data/sampleItems";

const QuotationBuilder = () => {
  // State for items catalog
  const [items, setItems] = useState(defaultItems);
  
  // State for quotation
  const [clientName, setClientName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  // State for subsections
  const [sections, setSections] = useState([]);
  
  // State for modals
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  
  // File input ref
  const fileInputRef = useRef(null);
  const quotationRef = useRef(null);
  
  // Export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Format price to Indian Rupees
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate section total
  const getSectionTotal = (sectionItems) => {
    return sectionItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  };

  // Calculate grand total
  const getGrandTotal = () => {
    return sections.reduce((sum, section) => sum + getSectionTotal(section.items), 0);
  };

  // Drag handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "copy";
    e.target.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDragOverSection(null);
    e.target.classList.remove("dragging");
  };

  const handleDragOver = (e, sectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverSection(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e, sectionId) => {
    e.preventDefault();
    setDragOverSection(null);
    
    if (draggedItem) {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id === sectionId) {
            const newItem = {
              ...draggedItem,
              uid: `${draggedItem.name}-${Date.now()}`,
            };
            return { ...section, items: [...section.items, newItem] };
          }
          return section;
        })
      );
      toast.success(`Added ${draggedItem.name} to section`);
    }
  };

  // Add new section
  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      toast.error("Please enter a section name");
      return;
    }
    
    const newSection = {
      id: `section-${Date.now()}`,
      title: newSectionName.trim(),
      items: [],
    };
    
    setSections((prev) => [...prev, newSection]);
    setNewSectionName("");
    setIsAddSectionOpen(false);
    toast.success(`Section "${newSection.title}" added`);
  };

  // Delete section
  const handleDeleteSection = (sectionId) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast.success("Section deleted");
  };

  // Remove item from section
  const handleRemoveItem = (sectionId, itemUid) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.uid !== itemUid),
          };
        }
        return section;
      })
    );
  };

  // Edit section name
  const startEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditingSectionName(section.title);
  };

  const saveEditSection = () => {
    if (!editingSectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }
    
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === editingSectionId) {
          return { ...section, title: editingSectionName.trim() };
        }
        return section;
      })
    );
    setEditingSectionId(null);
    setEditingSectionName("");
  };

  // CSV Upload handler
  const handleCSVUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const lines = text.split("\n").filter((line) => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        
        const newItems = dataLines.map((line) => {
          const [name, price, category, description] = line.split(",").map((s) => s.trim().replace(/"/g, ""));
          return { name, price, category, description };
        }).filter((item) => item.name && item.price && item.category);

        if (newItems.length > 0) {
          setItems(newItems);
          toast.success(`Loaded ${newItems.length} items from CSV`);
        } else {
          toast.error("No valid items found in CSV");
        }
      } catch (error) {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Export to PDF
  const handleExportPDF = async () => {
    if (!quotationRef.current) return;
    
    setIsExporting(true);
    toast.info("Generating PDF...");
    
    try {
      const element = quotationRef.current;
      const fileName = `${clientName || "Client"}_Quotation_${quotationDate}.pdf`;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" 
        },
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Group items by category and get unique categories
  const itemsByCategory = items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Get sorted category keys
  const categories = Object.keys(itemsByCategory).sort();

  return (
    <div className="min-h-screen bg-[#fafafa] font-body">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT PANEL - Quotation Paper (70%) */}
        <div className="w-full lg:w-[70%] p-4 md:p-8 lg:p-12 order-2 lg:order-1">
          <div
            ref={quotationRef}
            className="quotation-paper bg-white border border-border/40 shadow-xl shadow-black/5 mx-auto max-w-4xl p-8 md:p-12"
            data-testid="quotation-paper"
          >
            {/* Header */}
            <header className="mb-8">
              <h1
                className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-primary"
                data-testid="company-logo"
              >
                Eclat Spazio
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                Client Quotation
              </p>
            </header>

            <Separator className="my-6" />

            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <Label htmlFor="clientName" className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  data-testid="client-name-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="projectTitle" className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Project Title
                </Label>
                <Input
                  id="projectTitle"
                  data-testid="project-title-input"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="quotationDate" className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Date
                </Label>
                <Input
                  id="quotationDate"
                  data-testid="quotation-date-input"
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  className="border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
            </div>

            {/* Add Subsection Button */}
            <Button
              data-testid="add-section-btn"
              onClick={() => setIsAddSectionOpen(true)}
              className="w-full mb-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs font-medium no-print"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subsection
            </Button>

            {/* Sections */}
            {sections.length === 0 ? (
              <div
                className="border border-dashed border-border py-16 text-center text-muted-foreground"
                data-testid="empty-state"
              >
                <p className="text-sm">Drag items here to build quotation</p>
                <p className="text-xs mt-2">Click "Add Subsection" to get started</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="fade-in"
                    data-testid={`section-${section.id}`}
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-4">
                      {editingSectionId === section.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingSectionName}
                            onChange={(e) => setEditingSectionName(e.target.value)}
                            className="h-8 text-lg font-heading font-medium"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && saveEditSection()}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEditSection}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <h3
                          className="font-heading text-xl font-medium flex items-center gap-2 cursor-pointer hover:text-muted-foreground transition-colors"
                          onClick={() => startEditSection(section)}
                        >
                          {section.title}
                          <Edit2 className="w-3 h-3 opacity-50 no-print" />
                        </h3>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 no-print"
                        data-testid={`delete-section-${section.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Drop Zone Table */}
                    <div
                      className={`drop-zone border ${
                        dragOverSection === section.id
                          ? "drag-over border-primary"
                          : "border-border"
                      }`}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, section.id)}
                      data-testid={`drop-zone-${section.id}`}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border">
                            <TableHead className="w-[40%] text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                              Item Name
                            </TableHead>
                            <TableHead className="w-[40%] text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                              Description
                            </TableHead>
                            <TableHead className="w-[20%] text-right text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                              Price
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.items.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-center py-8 text-muted-foreground text-sm"
                              >
                                Drop items here
                              </TableCell>
                            </TableRow>
                          ) : (
                            section.items.map((item) => (
                              <TableRow
                                key={item.uid}
                                className="group border-b border-border/50 hover:bg-muted/30"
                                data-testid={`item-row-${item.uid}`}
                              >
                                <TableCell className="font-medium text-sm">
                                  {item.name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  <div className="flex items-center justify-end gap-2">
                                    {formatPrice(item.price)}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(section.id, item.uid)}
                                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 no-print"
                                      data-testid={`remove-item-${item.uid}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Section Total */}
                    <div className="flex justify-end mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-4">
                          Subsection Total:
                        </span>
                        <span className="font-mono font-medium">
                          {formatPrice(getSectionTotal(section.items))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Grand Total */}
                <Separator className="my-6" />
                <div
                  className="flex justify-end items-center"
                  data-testid="grand-total"
                >
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Grand Total
                    </p>
                    <p className="font-heading text-3xl font-medium">
                      {formatPrice(getGrandTotal())}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Button - Below Paper */}
          <div className="flex justify-center mt-8 no-print">
            <Button
              data-testid="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={sections.length === 0 || isExporting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs font-medium h-12 px-8"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              {isExporting ? "Generating..." : "Export as PDF"}
            </Button>
          </div>
        </div>

        {/* RIGHT PANEL - Item Selection (30%) */}
        <div
          className="w-full lg:w-[30%] bg-muted/30 border-l border-border lg:h-screen lg:sticky lg:top-0 order-1 lg:order-2 no-print"
          data-testid="item-selection-panel"
        >
          <ScrollArea className="h-full custom-scrollbar">
            <div className="p-6">
              {/* Panel Header */}
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-medium mb-1">
                  Item Catalog
                </h2>
                <p className="text-xs text-muted-foreground">
                  Drag items to add to quotation
                </p>
              </div>

              {/* CSV Upload */}
              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  data-testid="csv-upload-input"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-none border-dashed h-10 uppercase tracking-widest text-xs"
                  data-testid="csv-upload-btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Load CSV
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Format: name, price, category, description
                </p>
              </div>

              <Separator className="my-6" />

              {/* Category Columns */}
              <div className="space-y-6">
                {Object.entries(categoryNames).map(([catId, catName]) => (
                  <div key={catId}>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {catName}
                    </h3>
                    <div className="space-y-2">
                      {(itemsByCategory[catId] || []).map((item) => (
                        <div
                          key={item.name}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          className="draggable-item bg-white border border-border/60 hover:border-primary transition-colors p-3 group"
                          data-testid={`catalog-item-${item.name}`}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            </div>
                            <span className="text-sm font-mono text-primary flex-shrink-0">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Add New Subsection
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="sectionName" className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Subsection Name
            </Label>
            <Input
              id="sectionName"
              data-testid="section-name-input"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g., Living Room, Bathroom"
              className="rounded-none"
              onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSectionOpen(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              className="rounded-none"
              data-testid="confirm-add-section-btn"
            >
              Add Subsection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationBuilder;
