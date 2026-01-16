
export interface DeliveryRecord {
  [key: string]: string | number | undefined;
  // Core Info
  "IOM NO.": string | number;
  "Ref. IOM/ Fab. IOM"?: string;
  "BUYER": string;
  "GARMENTS"?: string;
  "FABRIC COMPOSITION": string;
  "CONSTRUCTION": string;
  "WEAVE": string;
  "Blend/Non Blend"?: string;
  "FINISH GSM"?: string | number;
  "GREIGE WIDTH"?: string | number;
  "FINISH WIDTH"?: string | number;
  "COLOR": string;
  "ORDER QTY. (YDS)"?: string | number;
  "EMERIZING": string;
  "EMERIZING MC Name"?: string;
  "Finish"?: string;
  "PROCESS ROUTE": string;
  "Development Type"?: string;
  "USER NAME"?: string;
  
  // Dates & OTP
  "IOM Creation Date"?: string;
  "Weaving IOM recv.Date"?: string;
  "Proposed Greige rcv Date"?: string;
  "FINISHED S/Y Ready Date (Tentative)"?: string;
  "Actual GREY ISSUE DATE"?: string;
  "OTP IOM cration To Delivery"?: string;
  "OTP WEAVING"?: string;
  "GREY RCVD. (YDS)"?: string | number;
  
  // Stages & Status
  "DEPARTMENT"?: string;
  "Stage-1"?: string;
  "Stage-2"?: string;
  "Grey Hold"?: string;
  "ACTUAL SAMPLE READY DATE"?: string;
  "PROCESS OTP"?: string;
  "Greige Source"?: string;
  "Floor"?: string;
  "Lead time (IOM Creation to Dispatch)"?: string;
  
  // Process Details
  "Singeing/Desize/Process date"?: string;
  "Singeing QTY"?: string | number;
  "Bleach"?: string;
  "Mercerized"?: string;
  "Peach"?: string;
  "ptr days"?: string | number;
  
  // Lab
  "Dye Lab in"?: string;
  "Dye Lab Out"?: string;
  "Dye Lab Days"?: string | number;
  
  // Dyeing
  "Dyeing In date"?: string;
  "Dyeing Floor"?: string;
  "Dye MC Name": string;
  "Dyeing Qty"?: string | number;
  "Topping-1"?: string;
  "Topping-2"?: string;
  "Topping-3"?: string;
  "Topping-4"?: string;
  "Dyeing Out date"?: string;
  "Dyeing Days"?: string | number;
  
  // Print
  "Print in Date"?: string;
  "Print Qty"?: string | number;
  "Print Out Date"?: string;
  "Print Days"?: string | number;
  
  // Final Delivery
  "Finish Date": string;
  "DELIVERY DATE": string;
  "DELIVERY QTY. (YDS)": number | string;
  "BEFORE INS. MKT RCVD. QTY (YDS)"?: string | number;
  "MCP Folder Status"?: string;
  "Remarks": string;
}

export type ViewMode = 'view' | 'admin';

export interface AppState {
  records: DeliveryRecord[];
  isLoggedIn: boolean;
  currentView: ViewMode;
}
