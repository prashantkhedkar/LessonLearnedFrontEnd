import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import DataTable, { Direction } from "react-data-table-component";
import { customStyles } from "./CustomTableStyle";
import RenderFontAwesome from "../../utils/RenderFontAwesome";
import { Row as MyRow } from "../../../models/row";
import ProgressBar from "react-bootstrap/ProgressBar";
import CssFunctions from "../../utils/cssFunctions";
import DataTableCSS from "./DataTableCustomCss.module.css";
import DataTableCSSAR from "./DataTableCustomCssAR.module.css";
import { UserContactInfo, UserGroupAvatar } from "../customAvatar/CustomAvatar";
import { useIntl } from "react-intl";
import SquarLoader from "../animation/SquarLoader";
import { Col, Row, Spinner } from "react-bootstrap";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
// import { dateToText } from '../common/label/LabelCategory';
import { Stack } from "@mui/material";
import { HtmlTooltip } from "../tooltip/HtmlTooltip";
import { formatDate, generateUUID } from "../../utils/common";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import { toast } from "react-toastify";
import { isNaN } from "formik";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

//////////////////////////////Events Handlers////////////////////////////////////////
function handleRowClicked(row: MyRow) {
  console.log("Cell " + row.id);
}
function handleCellClicked(row: MyRow) {
  console.log(row.id);
}

////////////////////////////////Style functions////////////////////////////////////////
const cssFunctions = new CssFunctions();

/////////////////////////Data Functions/////////////////////////////////////
function createColumns(
  tableConfig: string,
  lang: string,
  styles: { readonly [key: string]: string },
  onCellClick: (row: MyRow, clickedColumn: string) => void,
  intl,
  isArabicData?: boolean,
  componentsList?: ComponentAndProps[],
  editAccess?: boolean,
  component?: ComponentAndProps
) {
  const columns: any = [];
  const table = JSON.parse(tableConfig);
  // let columnCode = "lookupCode";
  let columnName = "columnName";
  let columnValue = "lookupName";
  let dataColumnName = "dataColumnName";
  if (lang.toLowerCase() == "ar") {
    // columnName = "columnNameAr";
    columnValue = "lookupNameAr";
    if (isArabicData) dataColumnName = "dataColumnNameAr";
  }
  if (!editAccess) {
    editAccess = false;
  }
  function numberExistsInString(
    numbersString: string,
    numberToCheck: number
  ): boolean {
    const numbersArray = numbersString.split(",");

    return numbersArray.some((numStr) => parseInt(numStr) === numberToCheck);
  }

  for (const config in table) {
    columns.push({
      dataColumnName: table[config][dataColumnName],
      name: table[config]["centerHeader"] ? (
        <div
          style={{ justifyContent: "center", display: "flex", width: "100%" }}
        >
          {intl.formatMessage({ id: table[config][columnName] })}
        </div>
      ) : (
        <>{intl.formatMessage({ id: table[config][columnName] })}</>
      ),
      selector: (row: MyRow) =>
        eval(
          "row['" +
            (table[config]["isObject"]
              ? table[config][dataColumnName] + "']['" + columnValue + "']"
              : table[config][dataColumnName] + "']")
        ),
      sortable: table[config]["sortable"],
      style: table[config]["style"],
      cell:
        table[config]["type"].toLowerCase() == "multipleuser"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]] ? (
                <UserGroupAvatar data={row[table[config][dataColumnName]]} />
              ) : (
                ""
              )
          : table[config]["type"].toLowerCase() == "singleuser"
          ? (row: MyRow) => (row[table[config][dataColumnName]] ? <></> : "")
          : table[config]["type"].toLowerCase() == "yesno"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]]
                ? lang == "ar"
                  ? "نعم"
                  : "Yes"
                : lang == "ar"
                ? "لا"
                : "No"
          : table[config]["type"].toLowerCase() == "date"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]]
                ? // formatDate(new Date(row[table[config][dataColumnName]]), '2-digit', '2-digit', 'numeric', "ar")
                  intl.formatDate(row[table[config][dataColumnName]]) ==
                  "تاريخ غير صحيح"
                  ? row[table[config][dataColumnName]]
                  : formatDate(
                      new Date(row[table[config][dataColumnName]]),
                      "2-digit",
                      "2-digit",
                      "numeric",
                      lang
                    )
                : ""
          : table[config]["type"].toLowerCase() == "currency"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]] != null &&
              row[table[config][dataColumnName]] != undefined
                ? !isNaN(row[table[config][dataColumnName]])
                  ? intl.formatNumber(row[table[config][dataColumnName]])
                  : row[table[config][dataColumnName]]
                : ""
          : table[config]["type"].toLowerCase() == "activenot"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]]
                ? lang == "ar"
                  ? "مفعل"
                  : "Yes"
                : lang == "ar"
                ? "غير مفعل"
                : "No"
          : table[config]["type"].toLowerCase() == "customobject"
          ? (row: MyRow) =>
              row[table[config][dataColumnName]]
                ? eval(
                    "row['" +
                      table[config][dataColumnName] +
                      "']['" +
                      table[config]["attributeName"] +
                      "']"
                  )
                : ""
          : table[config]["type"].toLowerCase() == "components"
          ? (row: any) => (
              <div className="row mx-0">
                {componentsList ? (
                  componentsList.map((component, index) => {
                    return component &&
                      numberExistsInString(
                        table[config]["componentsIndexes"],
                        index
                      ) ? (
                      <>
                        {<component.component {...component.props} row={row} />}
                      </>
                    ) : (
                      <></>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            )
          : table[config]["type"].toLowerCase() == "link"
          ? (row: MyRow) => (
              <div
                key={row.id}
                onClick={() =>
                  eval(
                    "onCellClick(row,'" + table[config][dataColumnName] + "')"
                  )
                }
                id={row.id + ""}
                className={`${styles.clickable} 
                                                    ${
                                                      table[config][
                                                        "isClassNameTheCode"
                                                      ]
                                                        ? styles[
                                                            row[
                                                              table[config][
                                                                dataColumnName
                                                              ]
                                                            ]["lookupCode"]
                                                          ]
                                                        : table[config][
                                                            "isClassNameFunction"
                                                          ]
                                                        ? styles[
                                                            eval(
                                                              "cssFunctions." +
                                                                table[config][
                                                                  "className"
                                                                ] +
                                                                "(row." +
                                                                table[config][
                                                                  dataColumnName
                                                                ] +
                                                                ")"
                                                            )
                                                          ]
                                                        : styles[
                                                            table[config][
                                                              "className"
                                                            ]
                                                          ]
                                                    }`}
              >
                <RenderFontAwesome
                  marginRight={lang == "en" ? "3px" : "0px"}
                  marginLeft={lang == "ar" ? "3px" : "0px"}
                  color={table[config]["fontAwesomeColor"]}
                  size="lg"
                  display={
                    (table[config]["fontAwesome"] == "" ? false : true) &&
                    (table[config]["hideFontAwesomeIfNoData"]
                      ? row[table[config][dataColumnName]] &&
                        (table[config]["isObject"]
                          ? row[table[config][dataColumnName]][columnValue]
                          : row[table[config][dataColumnName]]) != ""
                        ? true
                        : false
                      : true)
                  }
                  icon={
                    table[config]["isFontAwesomeFunction"]
                      ? eval(
                          "cssFunctions." +
                            table[config]["fontAwesome"] +
                            "(row['" +
                            (table[config]["isObject"]
                              ? table[config][dataColumnName] +
                                "']['lookupCode'])"
                              : table[config][dataColumnName] + "']")
                        )
                      : table[config]["fontAwesome"]
                  }
                />

                {cssFunctions.handleFormat(
                  table[config]["type"],
                  eval(
                    "row['" +
                      (table[config]["isObject"]
                        ? table[config][dataColumnName] +
                          "']['" +
                          columnValue +
                          "']"
                        : table[config][dataColumnName] + "']")
                  ),
                  lang,
                  intl
                )}
              </div>
            )
          : table[config]["type"].toLowerCase() == "customactions"
          ? (row: MyRow) => (
              <>
                <Stack direction="row">
                  <div className="p-2 me-4">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.EDIT",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'edit')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/edit-alt.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>
                  <div className="p-2">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.DELETE",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'delete')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/delete.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>
                </Stack>
              </>
            )
          : table[config]["type"].toLowerCase() == "customactionsview"
          ? (row: MyRow) => (
              <>
                <Stack direction="row">
                  <div className="p-2 me-4">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.EDIT",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'edit')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/edit-alt.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>
                  <div className="p-2">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.DELETE",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'delete')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/trash-2.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>
                  <div className="p-2 me-4">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.VIEW",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'view')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/icon-stroke-eye-on.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>
                </Stack>
              </>
            )
          : table[config]["type"].toLowerCase() == "cancel"
          ? (row: MyRow) => (
              <>
                <Stack direction="row">
                  <div className="p-2">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.EVENCLOSURE.CANCEL",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'cancel')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/trash-2.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>

                  <div className="p-2 ">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.VIEW",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'view')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/icon-stroke-eye-on.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>

                  {editAccess && (
                    <div className="p-2 me-4">
                      <HtmlTooltip
                        title={intl.formatMessage({
                          id: "MOD.CONFIG.BUTTON.EDIT",
                        })}
                      >
                        <button
                          type="button"
                          className="btn btn-active-light p-0"
                          style={{ cursor: "pointer" }}
                          aria-label="download"
                          id={"link" + generateUUID() + row.id}
                          onClick={() => eval("onCellClick(row,'edit')")}
                        >
                          <span className="prj-icon-stroke-plus">
                            <img
                              src={toAbsoluteUrl(
                                "/media/svg/mod-specific/edit-alt.svg"
                              )}
                            />
                          </span>
                        </button>
                      </HtmlTooltip>
                    </div>
                  )}
                </Stack>
              </>
            )
          : table[config]["type"].toLowerCase() == "editconf"
          ? (row: MyRow) => (
              <>
                <Stack direction="row">
                  <div className="p-2 ">
                    <HtmlTooltip
                      title={intl.formatMessage({
                        id: "MOD.CONFIG.BUTTON.VIEW",
                      })}
                    >
                      <button
                        type="button"
                        className="btn btn-active-light p-0"
                        style={{ cursor: "pointer" }}
                        aria-label="download"
                        id={"link" + generateUUID() + row.id}
                        onClick={() => eval("onCellClick(row,'view')")}
                      >
                        <span className="prj-icon-stroke-plus">
                          <img
                            src={toAbsoluteUrl(
                              "/media/svg/mod-specific/icon-stroke-eye-on.svg"
                            )}
                          />
                        </span>
                      </button>
                    </HtmlTooltip>
                  </div>

                  {editAccess && (
                    <div className="p-2 me-4">
                      <HtmlTooltip
                        title={intl.formatMessage({
                          id: "MOD.CONFIG.BUTTON.EDIT",
                        })}
                      >
                        <button
                          type="button"
                          className="btn btn-active-light p-0"
                          style={{ cursor: "pointer" }}
                          aria-label="download"
                          id={"link" + generateUUID() + row.id}
                          onClick={() => eval("onCellClick(row,'edit')")}
                        >
                          <span className="prj-icon-stroke-plus">
                            <img
                              src={toAbsoluteUrl(
                                "/media/svg/mod-specific/edit-alt.svg"
                              )}
                            />
                          </span>
                        </button>
                      </HtmlTooltip>
                    </div>
                  )}
                </Stack>
              </>
            )
          : table[config]["type"].toLowerCase() == "button"
          ? (row: MyRow) => (
              <Stack direction="row">
                <div
                  key={row.id}
                  onClick={() =>
                    eval(
                      "onCellClick(row,'" + table[config][dataColumnName] + "')"
                    )
                  }
                  id={row.id + ""}
                  className={`${styles.clickable} 
                                                                                  ${
                                                                                    table[
                                                                                      config
                                                                                    ][
                                                                                      "isClassNameTheCode"
                                                                                    ]
                                                                                      ? styles[
                                                                                          row[
                                                                                            table[
                                                                                              config
                                                                                            ][
                                                                                              dataColumnName
                                                                                            ]
                                                                                          ][
                                                                                            "lookupCode"
                                                                                          ]
                                                                                        ]
                                                                                      : table[
                                                                                          config
                                                                                        ][
                                                                                          "isClassNameFunction"
                                                                                        ]
                                                                                      ? styles[
                                                                                          eval(
                                                                                            "cssFunctions." +
                                                                                              table[
                                                                                                config
                                                                                              ][
                                                                                                "className"
                                                                                              ] +
                                                                                              "(row." +
                                                                                              table[
                                                                                                config
                                                                                              ][
                                                                                                dataColumnName
                                                                                              ] +
                                                                                              ")"
                                                                                          )
                                                                                        ]
                                                                                      : styles[
                                                                                          table[
                                                                                            config
                                                                                          ][
                                                                                            "className"
                                                                                          ]
                                                                                        ]
                                                                                  }`}
                >
                  <div className={styles.actionButton}>
                    <RenderFontAwesome
                      marginRight={lang == "en" ? "3px" : "0px"}
                      marginLeft={lang == "ar" ? "3px" : "0px"}
                      color={table[config]["fontAwesomeColor"]}
                      size="lg"
                      display={
                        (table[config]["fontAwesome"] == "" ? false : true) &&
                        (table[config]["hideFontAwesomeIfNoData"]
                          ? row[table[config][dataColumnName]] &&
                            (table[config]["isObject"]
                              ? row[table[config][dataColumnName]][columnValue]
                              : row[table[config][dataColumnName]]) != ""
                            ? true
                            : false
                          : true)
                      }
                      icon={
                        table[config]["isFontAwesomeFunction"]
                          ? eval(
                              "cssFunctions." +
                                table[config]["fontAwesome"] +
                                "(row['" +
                                (table[config]["isObject"]
                                  ? table[config][dataColumnName] +
                                    "']['lookupCode'])"
                                  : table[config][dataColumnName] + "']")
                            )
                          : table[config]["fontAwesome"]
                      }
                    />

                    {
                      cssFunctions.handleFormat(
                        table[config]["type"],
                        eval(
                          "row['" +
                            (table[config]["isObject"]
                              ? table[config][dataColumnName] +
                                "']['" +
                                columnValue +
                                "']"
                              : table[config][dataColumnName] + "']")
                        ),
                        lang,
                        intl
                      )
                      // add new tooltip component
                    }
                  </div>
                </div>
              </Stack>
            )
          : table[config]["type"].toLowerCase() == "popup"
          ? (row: MyRow) => (
              <Stack direction="row">
                <div
                  key={row.id}
                  onClick={() =>
                    eval(
                      "onCellClick(row,'" + table[config][dataColumnName] + "')"
                    )
                  }
                  id={row.id + ""}
                  className={`${styles.clickable} 
                                                                                             ${
                                                                                               table[
                                                                                                 config
                                                                                               ][
                                                                                                 "isClassNameTheCode"
                                                                                               ]
                                                                                                 ? styles[
                                                                                                     row[
                                                                                                       table[
                                                                                                         config
                                                                                                       ][
                                                                                                         dataColumnName
                                                                                                       ]
                                                                                                     ][
                                                                                                       "lookupCode"
                                                                                                     ]
                                                                                                   ]
                                                                                                 : table[
                                                                                                     config
                                                                                                   ][
                                                                                                     "isClassNameFunction"
                                                                                                   ]
                                                                                                 ? styles[
                                                                                                     eval(
                                                                                                       "cssFunctions." +
                                                                                                         table[
                                                                                                           config
                                                                                                         ][
                                                                                                           "className"
                                                                                                         ] +
                                                                                                         "(row." +
                                                                                                         table[
                                                                                                           config
                                                                                                         ][
                                                                                                           dataColumnName
                                                                                                         ] +
                                                                                                         ")"
                                                                                                     )
                                                                                                   ]
                                                                                                 : styles[
                                                                                                     table[
                                                                                                       config
                                                                                                     ][
                                                                                                       "className"
                                                                                                     ]
                                                                                                   ]
                                                                                             }`}
                >
                  <div className={styles.actionButton}>
                    <RenderFontAwesome
                      marginRight={lang == "en" ? "3px" : "0px"}
                      marginLeft={lang == "ar" ? "3px" : "0px"}
                      color={table[config]["fontAwesomeColor"]}
                      size="lg"
                      display={
                        (table[config]["fontAwesome"] == "" ? false : true) &&
                        (table[config]["hideFontAwesomeIfNoData"]
                          ? row[table[config][dataColumnName]] &&
                            (table[config]["isObject"]
                              ? row[table[config][dataColumnName]][columnValue]
                              : row[table[config][dataColumnName]]) != ""
                            ? true
                            : false
                          : true)
                      }
                      icon={
                        table[config]["isFontAwesomeFunction"]
                          ? eval(
                              "cssFunctions." +
                                table[config]["fontAwesome"] +
                                "(row['" +
                                (table[config]["isObject"]
                                  ? table[config][dataColumnName] +
                                    "']['lookupCode'])"
                                  : table[config][dataColumnName] + "']")
                            )
                          : table[config]["fontAwesome"]
                      }
                    />

                    {
                      // add new tooltip component
                    }
                  </div>
                </div>
              </Stack>
            )
          : table[config]["type"].toLowerCase() == "progressbar"
          ? (row: MyRow) => (
              <div style={{ width: "100%" }}>
                <ProgressBar
                  style={{ width: "100%" }}
                  variant={cssFunctions.progressBarColor(+row.progress)}
                  now={+row.progress}
                  label={`${+row.progress}%`}
                />
              </div>
            )
          : (row: MyRow) => (
              <div
                className={
                  table[config]["isClassNameTheCode"]
                    ? styles[row[table[config][dataColumnName]]["lookupCode"]]
                    : table[config]["isClassNameFunction"]
                    ? styles[
                        eval(
                          "cssFunctions." +
                            table[config]["className"] +
                            "(row." +
                            table[config][dataColumnName] +
                            ")"
                        )
                      ]
                    : styles[table[config]["className"]]
                }
                key={row.id}
                id={row.id + ""}
              >
                <RenderFontAwesome
                  marginRight={lang == "en" ? "3px" : "0px"}
                  marginLeft={lang == "ar" ? "3px" : "0px"}
                  color={table[config]["fontAwesomeColor"]}
                  size="lg"
                  display={
                    (table[config]["fontAwesome"] == "" ? false : true) &&
                    (table[config]["hideFontAwesomeIfNoData"]
                      ? row[table[config][dataColumnName]] &&
                        (table[config]["isObject"]
                          ? row[table[config][dataColumnName]][columnValue]
                          : row[table[config][dataColumnName]]) != ""
                        ? true
                        : false
                      : true)
                  }
                  icon={
                    table[config]["isFontAwesomeFunction"]
                      ? eval(
                          "cssFunctions." +
                            table[config]["fontAwesome"] +
                            "(row['" +
                            (table[config]["isObject"]
                              ? table[config][dataColumnName] +
                                "']['lookupCode'])"
                              : table[config][dataColumnName] + "']")
                        )
                      : table[config]["fontAwesome"]
                  }
                />
                {cssFunctions.handleFormat(
                  table[config]["type"],
                  eval(
                    "row['" +
                      (table[config]["isObject"]
                        ? table[config][dataColumnName] +
                          "']['" +
                          columnValue +
                          "']"
                        : table[config][dataColumnName] + "']")
                  ),
                  lang,
                  intl
                )}
              </div>
            ),
      minWidth: "50",
      maxWidth: "100%",
      width:
        lang.toLowerCase() === "ar" && table[config]["width-ar"]
          ? table[config]["width-ar"]
          : table[config]["width"],
    });
  }
  return columns;
}

export interface ComponentAndProps {
  component: React.FC<any>;
  props?: any;
}

const DataTableMain2 = forwardRef(
  (
    props: {
      invertSearchPosition?: boolean;
      selectableRows?: boolean;
      borderRadius?: string;
      displaySearchBar: boolean;
      searchBarMargin?: number;
      lang: string;
      tableConfig: string;
      onCellClick?: (row: MyRow, clickedColumn: string) => void;
      addComponent?: ComponentAndProps;
      componentsList?: ComponentAndProps[];
      isArabicData?: boolean;
      paginationServer?: boolean;
      paginationDefaultPage?: number;
      defaultPageSize?: number;
      editAccess?: boolean;
      noPagination?: boolean;
      getData?: (
        pageNumber?: number,
        pageSize?: number,
        sortColumn?: string,
        sortDirection?: string,
        searchText?: string,
        useSpinner?: boolean,
        isExcel?: boolean
      ) => void;
      exportExcel?: boolean;
      excelFileName?: string;
    },
    ref
  ) => {
    const [data, setData] = useState<MyRow[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [sortDirection, setSortDirection] = useState("desc");
    const [sortColumn, setSortColumn] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchData, setSearchData] = useState(data);
    const [refreshData, setRefreshData] = useState(false);
    const [excelData, setExcelData] = useState<MyRow[]>([]);
    const [excelDataStatus, setExcelDataStatus] = useState<
      "loading" | "completed" | "downloaded"
    >("downloaded");

    useImperativeHandle(ref, () => ({
      setData: (newData) => {
        setData(newData);
        if (!props.paginationServer) setSearchData(newData);
        transformPageNumberText();
      },
      setTotalRows: (newTotalRows) => setTotalRows(newTotalRows),
      setIsLoading: (newState) => setIsLoading(newState),
      setIsError: (isError) => setIsError(isError),
      setRefreshData: (newRefreshData) => setRefreshData(newRefreshData),
      setExcelData: (excelData) => setExcelData(excelData),
      setExcelDataStatus: (
        excelDataStatus: "loading" | "completed" | "downloaded"
      ) => setExcelDataStatus(excelDataStatus),
    }));

    function jsFixPageNumberText() {
      if (props.lang == "ar") {
        var divs = document.querySelectorAll(
          "#dataTable2Id nav>*:nth-child(3)"
        );
        if (divs && divs.length > 0) {
          for (var i = 0; i < divs.length; i++) {
            var div = divs[i] as HTMLElement;
            const splited = String(div.textContent).split("من اجمالي");
            if (splited.length == 2) {
              const numberSplited = splited[0].split("-");
              if (numberSplited.length == 2) {
                div.textContent =
                  numberSplited[0] +
                  " - " +
                  numberSplited[1] +
                  " من اجمالي " +
                  splited[1];
                // div.style.display = "inherit";
              }
            }
          }
        } else {
          var divs2 = document.getElementsByClassName("sc-kOPcWz sc-cWSHoV");
          for (var i = 0; i < divs2.length; i++) {
            var div = divs2[i] as HTMLElement;
            const splited = String(div.textContent).split("من اجمالي");
            if (splited.length == 2) {
              const numberSplited = splited[0].split("-");
              if (numberSplited.length == 2) {
                div.textContent =
                  numberSplited[0] +
                  " - " +
                  numberSplited[1] +
                  " من اجمالي " +
                  splited[1];
                // div.style.display = "inherit";
              }
            }
          }
        }
      }
    }

    function transformPageNumberText() {
      setTimeout(() => {
        jsFixPageNumberText();
      }, 1);

      setTimeout(() => {
        jsFixPageNumberText();
      }, 300);
    }

    useEffect(() => {
      setTimeout(() => {
        if (isLoading) setIsLoading(false);
        transformPageNumberText();
      }, 5000);
    }, []);

    const id = Math.floor(Math.random() * 999) + 1;
    const access = props.editAccess || false;
    const onCellClick = props.onCellClick;
    var dir = "ltr";
    var styles = DataTableCSS;
    var lookup = "lookupName";

    if (props.lang.toLowerCase() == "ar") {
      dir = "rtl";
      styles = DataTableCSSAR;
      lookup = "lookupNameAr";
    }
    const intl = useIntl();
    const columns = createColumns(
      props.tableConfig,
      props.lang,
      styles,
      onCellClick ? onCellClick : () => {},
      intl,
      props.isArabicData,
      props.componentsList,
      props.editAccess
    );

    function searchDataFunc(event: { target: { value: string } }) {
      const tableConfig = JSON.parse(props.tableConfig);

      var conditions = "";
      let dataColumnName = "dataColumnName";
      if (props.lang == "ar" && props.isArabicData)
        dataColumnName = "dataColumnNameAr";
      for (let config in tableConfig) {
        if (tableConfig[config]["isSearchable"]) {
          if (conditions != "") conditions += "||";
          conditions += "(row." + tableConfig[config][dataColumnName];
          if (tableConfig[config]["isObject"]) conditions += "." + lookup;
          conditions +=
            "+'').toLowerCase().includes(event.target.value.toLowerCase())";
        }
      }
      const filteredData = data.filter((row: MyRow) => {
        return eval(conditions);
      });
      setSearchData(filteredData);
    }

    function handleSearchDataFuncServer() {
      const tempSearchText = (
        document.getElementById("search_" + id) as HTMLInputElement
      ).value;
      if (tempSearchText && tempSearchText != "") {
        if (tempSearchText.length < 3) {
          toast.warning(
            intl.formatMessage({
              id: "DATATABLE.SEARCHTEXT.MinimumLengthNotReached",
            })
          );
        } else {
          setSearchText(tempSearchText);
          searchDataFuncServer(tempSearchText);
        }
      }

      transformPageNumberText();
    }

    const borderR = props.borderRadius ? props.borderRadius : "8px";

    function noData() {
      return <NoRecordsAvailable />;
    }

    function handleSort(column) {
      if (props.paginationServer) {
        if (column && column != "") {
          setSortDirection(sortDirection == "asc" ? "desc" : "asc");
          setSortColumn(column.dataColumnName);
          if (props.getData && props.paginationServer)
            props.getData(
              1,
              pageSize,
              column.dataColumnName,
              sortDirection == "asc" ? "desc" : "asc",
              searchText
            );
        }
      }

      transformPageNumberText();
    }

    function handleSearchServerEnterButton(
      event: React.KeyboardEvent<HTMLInputElement>
    ) {
      if (event.key === "Enter") {
        handleSearchDataFuncServer();
      }
    }

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(
      props.defaultPageSize ? props.defaultPageSize : 10
    );
    const [searchText, setSearchText] = useState("");

    function handlePageChange(funcPageNumber: number) {
      setPageNumber(funcPageNumber);
      if (props.getData && props.paginationServer)
        props.getData(
          funcPageNumber,
          pageSize,
          sortColumn,
          sortDirection,
          searchText
        );

      transformPageNumberText();
    }

    function handleRowsPerPageChange(funcPageSize: number) {
      setPageSize(funcPageSize);
      setPageNumber(1);
      if (props.getData && props.paginationServer)
        props.getData(1, funcPageSize, sortColumn, sortDirection, searchText);

      transformPageNumberText();
    }

    function searchDataFuncServer(funcSearchText) {
      setPageNumber(1);
      if (props.getData && props.paginationServer)
        props.getData(
          1,
          pageSize,
          sortColumn,
          sortDirection,
          funcSearchText,
          true
        );

      transformPageNumberText();
    }

    function onSearchClearButton() {
      setPageNumber(1);
      setSearchText("");
      const searchTextNode = document.getElementById(
        "search_" + id
      ) as HTMLInputElement;
      searchTextNode.value = "";

      transformPageNumberText();
    }

    useEffect(() => {
      if (props.paginationServer) {
        if ((!searchText || searchText == "") && props.getData) {
          props.getData(
            1,
            pageSize,
            sortColumn,
            sortDirection,
            searchText,
            true
          );
        }
      } else {
        if (props.getData && data.length == 0)
          props.getData(
            1,
            pageSize,
            sortColumn,
            sortDirection,
            searchText,
            true
          );

        setSearchData(data);
      }

      transformPageNumberText();
    }, [searchText]);

    useEffect(() => {
      if (refreshData && props.getData) {
        if (
          pageNumber > 1 &&
          data.length == 1 &&
          totalRows == pageSize * (pageNumber - 1) + 1
        ) {
          setPageNumber(pageNumber - 1);
          props.getData(
            pageNumber - 1,
            pageSize,
            sortColumn,
            sortDirection,
            searchText,
            true
          );
        } else
          props.getData(
            pageNumber,
            pageSize,
            sortColumn,
            sortDirection,
            searchText,
            true
          );
        setRefreshData(false);
      }
    }, [refreshData]);

    useEffect(() => {
      transformPageNumberText();
    }, [data, searchData, isLoading]);

    return (
      <div dir={dir} id="dataTable2Id" style={{ borderRadius: borderR }}>
        {!isError ? (
          <div className="d-flex flex-column gap-6 align-items-stretch">
            {(props.displaySearchBar || props.addComponent?.props) && (
              <div className="d-flex flex-row justify-content-between gap-6 search-btn-bg">
                {props.displaySearchBar ? (
                  props.paginationServer ? (
                    <div className={styles["search"]}>
                      <svg
                        className={styles["icon-stroke-search"]}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ cursor: "pointer" }}
                        onClick={handleSearchDataFuncServer}
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M3.8499 10.9984C3.8499 7.0496 7.05107 3.84844 10.9999 3.84844C14.9487 3.84844 18.1499 7.0496 18.1499 10.9984C18.1499 14.9473 14.9487 18.1484 10.9999 18.1484C7.05107 18.1484 3.8499 14.9473 3.8499 10.9984ZM10.9999 2.14844C6.11218 2.14844 2.1499 6.11072 2.1499 10.9984C2.1499 15.8862 6.11218 19.8484 10.9999 19.8484C13.1377 19.8484 15.0984 19.0905 16.628 17.8286L19.3989 20.5995C19.7308 20.9314 20.269 20.9314 20.6009 20.5995C20.9329 20.2675 20.9329 19.7293 20.6009 19.3974L17.8301 16.6265C19.0919 15.0969 19.8499 13.1362 19.8499 10.9984C19.8499 6.11072 15.8876 2.14844 10.9999 2.14844Z"
                          fill="#9CA3AF"
                        ></path>
                      </svg>

                      <div className={styles["search2"] + " text-align-start"}>
                        <input
                          id={"search_" + id}
                          style={{
                            width: "99%",
                            border: "none",
                            outline: "none",
                          }}
                          type="text"
                          placeholder={
                            props.lang.toLowerCase() == "ar" ? "بحث" : "Search"
                          }
                          onKeyDown={handleSearchServerEnterButton}
                        />
                      </div>
                      {searchText && searchText != "" && (
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={onSearchClearButton}
                        >
                          <RenderFontAwesome
                            display
                            icon="faXmarkCircle"
                            size="xl"
                            color="#9CA3AF"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles["search"]}>
                      <svg
                        className={styles["icon-stroke-search"]}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M3.8499 10.9984C3.8499 7.0496 7.05107 3.84844 10.9999 3.84844C14.9487 3.84844 18.1499 7.0496 18.1499 10.9984C18.1499 14.9473 14.9487 18.1484 10.9999 18.1484C7.05107 18.1484 3.8499 14.9473 3.8499 10.9984ZM10.9999 2.14844C6.11218 2.14844 2.1499 6.11072 2.1499 10.9984C2.1499 15.8862 6.11218 19.8484 10.9999 19.8484C13.1377 19.8484 15.0984 19.0905 16.628 17.8286L19.3989 20.5995C19.7308 20.9314 20.269 20.9314 20.6009 20.5995C20.9329 20.2675 20.9329 19.7293 20.6009 19.3974L17.8301 16.6265C19.0919 15.0969 19.8499 13.1362 19.8499 10.9984C19.8499 6.11072 15.8876 2.14844 10.9999 2.14844Z"
                          fill="#9CA3AF"
                        ></path>
                      </svg>

                      <div className={styles["search2"]}>
                        <input
                          style={{
                            maxWidth: "99%",
                            border: "none",
                            outline: "none",
                          }}
                          type="text"
                          placeholder={
                            props.lang.toLowerCase() == "ar" ? "بحث" : "Search"
                          }
                          onChange={searchDataFunc}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ marginLeft: "auto" }}></div>
                )}
                {props.addComponent?.props && (
                  <div id="addCompo" className="add-btn-width">
                    <props.addComponent.component
                      {...props.addComponent.props}
                      data={data}
                    />
                  </div>
                )}
              </div>
            )}
            {isLoading ? (
              <div style={{ marginTop: "7rem" }}>
                <SquarLoader />
              </div>
            ) : (
              <>
                {props.exportExcel && (
                  <div id="addCompo" className="add-btn-width">
                    <ExportToExcel
                      excelData={excelData}
                      lang={props.lang}
                      tableConfig={props.tableConfig}
                      searchText={searchText}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      getData={props.getData}
                      totalRows={totalRows}
                      excelDataStatus={excelDataStatus}
                      setExcelDataStatus={setExcelDataStatus}
                      excelFileName={props.excelFileName}
                    />
                  </div>
                )}
                <div className="data-table-container animate-item">
                  <DataTable
                    key={"DT" + generateUUID()}
                    selectableRows={props.selectableRows}
                    data={props.paginationServer ? data : searchData}
                    responsive={true}
                    fixedHeader
                    customStyles={customStyles}
                    onRowClicked={handleRowClicked}
                    direction={
                      props.lang == "ar" ? Direction.RTL : Direction.LTR
                    }
                    paginationComponentOptions={{
                      rowsPerPageText:
                        props.lang == "ar"
                          ? "اختيار عدد السجلات"
                          : "Rows per page",
                      rangeSeparatorText:
                        props.lang == "ar" ? "من اجمالي" : "of total",
                    }}
                    noDataComponent={noData()}
                    // Server Side Pagination
                    pagination={!props.noPagination}
                    paginationServer={props.paginationServer}
                    paginationTotalRows={
                      props.paginationServer ? totalRows : undefined
                    }
                    paginationDefaultPage={pageNumber}
                    onChangePage={(e) => {
                      handlePageChange(e);
                    }}
                    onSort={(column) => {
                      handleSort(column);
                    }}
                    sortServer={props.paginationServer}
                    sortIcon={
                      props.paginationServer ? (
                        <div
                          className={
                            sortDirection == "asc"
                              ? styles.sortArrowDown
                              : styles.sortArrowUp
                          }
                        >
                          <span className="sc-kpDqfm ">▲</span>
                        </div>
                      ) : undefined
                    }
                    columns={columns}
                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
                    paginationPerPage={pageSize}
                    onChangeRowsPerPage={(e) => {
                      handleRowsPerPageChange(e);
                    }}
                  ></DataTable>
                </div>
              </>
            )}
          </div>
        ) : (
          <NoRecordsAvailable customText="MOD.EXTERNAL.ERROR.MESSAGE" />
        )}
      </div>
    );
  }
);

export default DataTableMain2;

function ExportToExcel(props: {
  excelData: MyRow[];
  excelDataStatus: "loading" | "completed" | "downloaded";
  sortColumn?: string;
  sortDirection?: string;
  searchText?: string;
  tableConfig: string;
  lang: string;
  totalRows: number;
  getData?: (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean,
    isExcel?: boolean
  ) => void;
  setExcelDataStatus: (
    excelDataStatus: "loading" | "completed" | "downloaded"
  ) => void;
  excelFileName?: string;
}) {
  const intl = useIntl();
  const table = JSON.parse(props.tableConfig);
  let columnName = "columnName";
  let dataColumnName = "dataColumnName";

  function triggerProcess() {
    if (props.getData)
      props.getData(
        1,
        props.totalRows,
        props.sortColumn,
        props.sortDirection,
        props.searchText,
        false,
        true
      );
  }

  useEffect(() => {
    try {
      if (props.excelDataStatus == "completed") {
        var dataToExport = new Array();
        if (props.excelData) {
          if (props.excelData.length < 1)
            toast.info(
              props.lang == "ar"
                ? "لا توجد بيانات للتصدير"
                : "There is no data to export"
            );
          else {
            for (var i in props.excelData) {
              var obj = new Object();
              for (const config in table) {
                if (
                  table[config][dataColumnName] &&
                  table[config][dataColumnName] != ""
                ) {
                  if (table[config]["type"] == "date")
                    obj[intl.formatMessage({ id: table[config][columnName] })] =
                      convertToDDMMYYYY(
                        props.excelData[i][table[config][dataColumnName]]
                      );
                  else {
                    if (table[config]["useIntl"])
                      obj[
                        intl.formatMessage({ id: table[config][columnName] })
                      ] = intl.formatMessage({
                        id: props.excelData[i][table[config][dataColumnName]],
                      });
                    else
                      obj[
                        intl.formatMessage({ id: table[config][columnName] })
                      ] = props.excelData[i][table[config][dataColumnName]];
                  }
                }
              }
              dataToExport.push(obj);
            }

            const now = dayjs();
            const timestamp = now.format("YYYY-MM-DD_HH-mm-ss");

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            worksheet["!sheetView"] = [{ rightToLeft: true }];
            const fileName =
              props.excelFileName && props.excelFileName != ""
                ? props.excelFileName
                : "Data";
            XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
            XLSX.writeFile(workbook, `${fileName} - ${timestamp}.xlsx`);
          }
        } else
          toast.info(
            props.lang == "ar"
              ? "لا توجد بيانات للتصدير"
              : "There is no data to export"
          );
        props.setExcelDataStatus("downloaded");
      }
    } catch (e) {
      props.setExcelDataStatus("downloaded");
    }
  }, [props.excelData, props.excelDataStatus]);

  return (
    <>
      <button
        className="btn MOD_btn btn-create w-10 me-2 btn-border-brown"
        onClick={triggerProcess}
        disabled={props.excelDataStatus != "downloaded"}
      >
        {props.lang == "ar" ? "تصدير الى إكسل" : "Export to Excel"}
        {props.excelDataStatus == "loading" && (
          <Spinner size="sm" animation="border" />
        )}
      </button>
    </>
  );
}

const convertToDDMMYYYY = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export interface setDataInterface {
  setData: (newData) => void;
  setTotalRows: (newTotalRows) => void;
  setIsLoading: (isLoading) => void;
  setIsError: (isError) => void;
  setRefreshData: (refreshData) => void;
  setExcelData: (newExcelData) => void;
  setExcelDataStatus: (
    excelDataStatus: "loading" | "completed" | "downloaded"
  ) => void;
}
