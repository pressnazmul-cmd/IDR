
import { DeliveryRecord } from '../types';
import Papa from 'papaparse';
import { getSupabase, getSupabaseConfig } from './supabaseClient';

const DB_NAME = 'IOM_REPORT_DB';
const STORE_NAME = 'records';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const formatSupabaseError = (error: any): string => {
  if (!error) return "Unknown error";
  if (typeof error === 'string') return error;
  const parts = [];
  if (error.message) parts.push(error.message);
  if (error.details) parts.push(`Details: ${error.details}`);
  if (error.code) parts.push(`Code: ${error.code}`);
  return parts.length > 0 ? parts.join(' | ') : JSON.stringify(error);
};

export const saveRecordsLocally = async (records: DeliveryRecord[]): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.clear();
  records.forEach(r => store.add(r));
  return new Promise((res) => { transaction.oncomplete = () => res(); });
};

/**
 * Normalizes Excel headers to snake_case database columns
 */
const sanitizeRecord = (record: any) => {
  const sanitized: any = {};
  
  const numericColumns = [
    'iom_no', 'finish_gsm', 'greige_width', 'finish_width', 'order_qty_yds', 
    'grey_rcvd_yds', 'singeing_qty', 'ptr_days', 'dye_lab_days', 'dyeing_qty', 
    'dyeing_days', 'print_qty', 'print_days', 'delivery_qty_yds', 'before_ins_mkt_rcvd_qty_yds'
  ];

  Object.keys(record).forEach(key => {
    if (key === 'id') return;
    
    let dbKey = key.toLowerCase()
      .trim()
      .replace(/[\s\./-]+/g, '_')
      .replace(/[()]/g, '')
      .replace(/_+/g, '_')
      .replace(/_$/, '');

    let value = record[key];
    
    if (numericColumns.includes(dbKey)) {
      const cleanVal = String(value || '').replace(/,/g, '').trim();
      const num = parseFloat(cleanVal);
      value = !isNaN(num) ? num : null;
    } else {
      value = value === null || value === undefined ? '' : String(value).trim();
    }
    
    sanitized[dbKey] = value;
  });
  return sanitized;
};

export const pushToSupabase = async (records: DeliveryRecord[]) => {
  const client = getSupabase();
  try {
    const sanitizedData = records.map(r => sanitizeRecord(r));
    const { error: delError } = await client.from('delivery_records').delete().neq('id', -1); 
    if (delError) throw delError;

    const chunkSize = 40; 
    for (let i = 0; i < sanitizedData.length; i += chunkSize) {
      const chunk = sanitizedData.slice(i, i + chunkSize);
      const { error: insError } = await client.from('delivery_records').insert(chunk);
      if (insError) throw insError;
    }
  } catch (err: any) {
    throw new Error(formatSupabaseError(err));
  }
};

export const fetchFromSupabase = async (): Promise<DeliveryRecord[]> => {
  const client = getSupabase();
  try {
    const { data, error } = await client
      .from('delivery_records')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      ...row,
      "IOM NO.": row.iom_no,
      "Ref. IOM/ Fab. IOM": row.ref_iom_fab_iom,
      "BUYER": row.buyer,
      "GARMENTS": row.garments,
      "FABRIC COMPOSITION": row.fabric_composition,
      "CONSTRUCTION": row.construction,
      "WEAVE": row.weave,
      "Blend/Non Blend": row.blend_non_blend,
      "FINISH GSM": row.finish_gsm,
      "GREIGE WIDTH": row.greige_width,
      "FINISH WIDTH": row.finish_width,
      "COLOR": row.color,
      "ORDER QTY. (YDS)": row.order_qty_yds,
      "EMERIZING": row.emerizing,
      "EMERIZING MC Name": row.emerizing_mc_name,
      "Finish": row.finish,
      "PROCESS ROUTE": row.process_route,
      "Development Type": row.development_type,
      "USER NAME": row.user_name,
      "IOM Creation Date": row.iom_creation_date,
      "Weaving IOM recv.Date": row.weaving_iom_recv_date,
      "Proposed Greige rcv Date": row.proposed_greige_rcv_date,
      "FINISHED S/Y Ready Date (Tentative)": row.finished_s_y_ready_date_tentative,
      "Actual GREY ISSUE DATE": row.actual_grey_issue_date,
      "OTP IOM cration To Delivery": row.otp_iom_cration_to_delivery,
      "OTP WEAVING": row.otp_weaving,
      "GREY RCVD. (YDS)": row.grey_rcvd_yds,
      "DEPARTMENT": row.department,
      "Stage-1": row.stage_1,
      "Stage-2": row.stage_2,
      "Grey Hold": row.grey_hold,
      "ACTUAL SAMPLE READY DATE": row.actual_sample_ready_date,
      "PROCESS OTP": row.process_otp,
      "Greige Source": row.greige_source,
      "Floor": row.floor,
      "Lead time (IOM Creation to Dispatch)": row.lead_time_iom_creation_to_dispatch,
      "Singeing/Desize/Process date": row.singeing_desize_process_date,
      "Singeing QTY": row.singeing_qty,
      "Bleach": row.bleach,
      "Mercerized": row.mercerized,
      "Peach": row.peach,
      "ptr days": row.ptr_days,
      "Dye Lab in": row.dye_lab_in,
      "Dye Lab Out": row.dye_lab_out,
      "Dye Lab Days": row.dye_lab_days,
      "Dyeing In date": row.dyeing_in_date,
      "Dyeing Floor": row.dyeing_floor,
      "Dye MC Name": row.dye_mc_name,
      "Dyeing Qty": row.dyeing_qty,
      "Topping-1": row.topping_1,
      "Topping-2": row.topping_2,
      "Topping-3": row.topping_3,
      "Topping-4": row.topping_4,
      "Dyeing Out date": row.dyeing_out_date,
      "Dyeing Days": row.dyeing_days,
      "Print in Date": row.print_in_date,
      "Print Qty": row.print_qty,
      "Print Out Date": row.print_out_date,
      "Print Days": row.print_days,
      "Finish Date": row.finish_date,
      "DELIVERY DATE": row.delivery_date,
      "DELIVERY QTY. (YDS)": row.delivery_qty_yds,
      "BEFORE INS. MKT RCVD. QTY (YDS)": row.before_ins_mkt_rcvd_qty_yds,
      "MCP Folder Status": row.mcp_folder_status,
      "Remarks": row.remarks
    })) as DeliveryRecord[];
  } catch (err: any) {
    throw new Error(formatSupabaseError(err));
  }
};

export const getLocalRecords = async (): Promise<DeliveryRecord[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();
  return new Promise((res) => { request.onsuccess = () => res(request.result); });
};
