import React from 'react'
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { BtnLabeltxtMedium2 } from '../common/formsLabels/detailLabels';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';

export const ExportToExcel = ({ fetchApiDataToExport, fileName }) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = async (fileName) => {
    const apiData = await fetchApiDataToExport();
    
    if (!apiData?.length) return

    const ws = XLSX.utils.json_to_sheet(apiData);
    /* custom headers */
    //XLSX.utils.sheet_add_aoa(ws, [["Request ID", "News Title", "Company Name"]], { origin: "A1" });
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return (
    <button onClick={(e) => exportToCSV(fileName)} className='btn MOD_btn btn-create ms-5'>
      <img src={toAbsoluteUrl('/media/svg/mod-specific/dpwebsite/file.svg')} />
      <BtnLabeltxtMedium2 text={'MOD.GLOBAL.BUTTON.EXPORT'} />
    </button>
  );
};