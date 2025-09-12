import { useEffect, useState } from "react";
import {
  BtnLabeltxtMedium2,
  DetailLabels,
} from "../common/formsLabels/detailLabels";
import TreeView, { NodeId, flattenTree } from "react-accessible-treeview";
import { useAppDispatch } from "../../../../store";
import {
  addUpdateUnit,
  fetchMainUnitListAsync,
  fetchSubUnitListAsync,
} from "../../services/globalSlice";
import mockMainUnitList from "./mockMainUnitList.json"; // For testing only: import mock data from JSON
import { UnitModel } from "../../../models/global/unitModel";
import { writeToBrowserConsole } from "../../utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import "./UnitTreeView.css";
import cx from "classnames";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useIntl } from "react-intl";
import { AddUnitFavRequestModel } from "../../../models/global/personModel";
import FancyCheckbox from "./FancyCheckbox";
import { useAuth } from "../../auth/core/Auth";
import React from "react";

// Define the type for node data in the state
type NodeData = {
  id: number;
  name: string;
  children: number[];
  parent: number | null;
  isBranch?: boolean;
  rootParentName: string;
  leaderId?: number;
};

interface props {
  onUnitSelect: Function;
  selectedUnitIds: number[];
  selectedUnitList: any[];
  isSingleSelection: boolean;
}

export default function UnitTreeView({
  onUnitSelect,
  selectedUnitIds,
  selectedUnitList,
  isSingleSelection,
}: props) {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { auth } = useAuth();
  const [unitModel, setUnitModel] = useState<UnitModel[]>([]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [selectedUnits, setSelectedUnits] = useState<any[]>([]);

  const [errors, setErrors] = useState({}); // Track "no data" errors

  // const [fetchedIds, setFetchedIds] = useState<Set<number>>(new Set());

  const [showLoader, setShowLoader] = useState(false);

  const [favListData, setUnitFavListData] = useState<AddUnitFavRequestModel[]>(
    []
  );
  const [unitFavList, setUnitFavList] = useState<number[]>([]);

  const [tabValue, setTabValue] = React.useState("2");

  const [folder, setFolder] = useState<any>({
    id: 0,
    name: "",
    children: [],
    leaderId: 0,
  });

  flattenTree(folder);

  // For testing only: fetch mock data
  // To use mock data, comment out the above useEffect and uncomment this one
  useEffect(() => {
    try {
      let output = (mockMainUnitList as UnitModel[]).filter(
        (item) => item.id != Number(auth?.unitId)
      );
      setUnitModel(output);

      const _data = folder;
      const _unitTree: NodeData[] = [];
      output.forEach((item) => {
        _unitTree.push({
          name:
            item.name +
            "$" +
            Number(item.leaderId == null ? 0 : item.leaderId),
          id: item.id,
          children: [],
          parent: item.parentUnitId ? item.parentUnitId : null,
          rootParentName: item.name,
          leaderId: Number(item.leaderId == null ? 0 : item.leaderId),
        });

        _data.children.push({
          id: item.id,
          name: item.name,
          children: [],
          parent: item.parentUnitId ? item.parentUnitId : 0,
          isBranch: item.isMainUnit,
          leaderId: Number(item.leaderId == null ? 0 : item.leaderId),
        });
      });
      const data = flattenTree(_data);

      setFolder(data);
      setSelectedIds(selectedUnitIds);
      setSelectedUnits(selectedUnitList);
    } catch (e) {
      writeToBrowserConsole(e);
    }
  }, []);

  // useEffect(() => {
  //   dispatch(fetchMainUnitListAsync({ pageNumber: 0, rowsPerPage: 100 })).then(
  //     (response) => {
  //       try {
  //         var output = response.payload.data as UnitModel[];
  //         output = output.filter((item) => item.id != Number(auth?.unitId));
  //         setUnitModel(output);

  //         const _data = folder;
  //         const _unitTree: NodeData[] = [];
  //         output.forEach((item) => {
  //           _unitTree.push({
  //             name:
  //               item.name +
  //               "$" +
  //               Number(item.leaderId == null ? 0 : item.leaderId),
  //             id: item.id,
  //             children: [],
  //             parent: item.parentUnitId ? item.parentUnitId : null,
  //             rootParentName: item.name,
  //             leaderId: Number(item.leaderId == null ? 0 : item.leaderId),
  //           });

  //           _data.children.push({
  //             id: item.id,
  //             name: item.name,
  //             // +
  //             // "$" +
  //             // Number(item.leaderId == null ? 0 : item.leaderId),
  //             children: [],
  //             parent: item.parentUnitId ? item.parentUnitId : 0,
  //             isBranch: item.isMainUnit,
  //             leaderId: Number(item.leaderId == null ? 0 : item.leaderId),
  //           });
  //         });
  //         const data = flattenTree(_data);

  //         setFolder(data);
  //         setSelectedIds(selectedUnitIds);
  //         setSelectedUnits(selectedUnitList);
  //       } catch (e) {
  //         writeToBrowserConsole(e);
  //       }
  //     }
  //   );
  // }, []);

  const ArrowIcon = ({ isOpen, className }) => {
    if (isOpen) return <FontAwesomeIcon icon={faCaretDown} color="#9CA3AF" />;
    else return <FontAwesomeIcon icon={faCaretRight} color="#9CA3AF" />;
  };

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set<NodeId>([]));
  const [folderLoaded, setFolderLoaded] = useState({ [0]: true });

  const updateTreeData = (
    list: UnitModel[],
    id: number,
    newChildren: UnitModel[],
    isShared?: boolean
  ): UnitModel[] => {
    const updatedTree: NodeData[] = JSON.parse(
      JSON.stringify(list)
    ) as NodeData[];
    const existingNodeIds = new Set(updatedTree.map((node) => node.id));

    if (newChildren) {
      const newNodes = newChildren.filter(
        (child) => !existingNodeIds.has(child.id)
      );
      if (newNodes && newNodes.length > 0) {
        return [...updatedTree, ...newNodes];
      }
    }

    return updatedTree;
  };

  const loadData = (element) => {
    setIsDataLoading(true);
    dispatch(
      fetchSubUnitListAsync({
        pageNumber: 0,
        rowsPerPage: 100,
        mainUnitId: Number(element.id),
      })
    ).then((response) => {
      try {
        var output = response.payload.data as UnitModel[];
        setUnitModel(output);
        setIsDataLoading(false);

        const _unitTree: NodeData[] = [];
        output.forEach((item) => {
          _unitTree.push({
            name: item.name,
            id: item.id,
            children: [0],
            parent: item.parentUnitId ? item.parentUnitId : null,
            rootParentName: element.name + " / " + item.name,
            leaderId: Number(item.leaderId == null ? 0 : item.leaderId),
          });
        });

        setFolder((value) => {
          const _value = value.map((el) => {
            if (el.id === Number(element.id)) {
              return {
                ...el,
                children: [
                  ...new Set([...el.children, ...output.map((e) => e.id)]),
                ],
              };
            } else return el;
          });

          const newData = updateTreeData(_value, Number(element.id), _unitTree);
          //setExpandedIds(new Set(newData.map((e) => e.id)));
          setExpandedIds((prev) => new Set(prev).add(Number(element.id)));
          setIsDataLoading(false);
          return newData;
        });
        setFolderLoaded((value) => {
          const newvals = value || {};
          if (element.id) newvals[element.id] = true;
          setIsDataLoading(false);
          return newvals;
        });
      } catch (e) {
        writeToBrowserConsole(e);
      }
    });
  };

  const AddUpdateUnits = (uModel: UnitModel) => {
    try {
      dispatch(addUpdateUnit({ formDataObject: uModel }));
    } catch (e) {
      writeToBrowserConsole("Error at AddUpdateUsers " + e);
    }
  };
  const handleCheckboxChange = (element, isChecked) => {
    const nodeId = element.id;
    setShowLoader(true);
    if (isChecked) {
      try {
        if (isSingleSelection) {
          setSelectedIds([nodeId]);
          let unitsObj: any = {
            value: element.id,
            label: element.name,
          };
          setSelectedUnits([unitsObj]);

          let objUnitModel: UnitModel = {
            id: element.id,
            name: element.name,
          };
          AddUpdateUnits(objUnitModel);
        } else {
          setSelectedIds((prev) =>
            isChecked ? [...prev, nodeId] : prev.filter((id) => id !== nodeId)
          );
          let unitsObj: any = {
            value: element.id,
            label: element.name,
          };
          setSelectedUnits((prev) => [...prev, unitsObj]);

          let objUnitModel: UnitModel = {
            id: element.id,
            name: element.name,
          };
          AddUpdateUnits(objUnitModel);
        }
        setShowLoader(false);
        return;
      } catch (err) {
        console.error("API error:", err);
        setShowLoader(false);
      }
    } else {
      if (isSingleSelection) {
        setSelectedIds(selectedUnitIds.filter((id) => id !== nodeId));
        let filteredItem: any[] = [];
        filteredItem = selectedUnits.filter((item) => item.value !== nodeId);
        setSelectedUnits([filteredItem]);
        setShowLoader(false);
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== nodeId));
        let filteredItem: any[] = [];
        filteredItem = selectedUnits.filter((item) => item.value !== nodeId);
        setSelectedUnits([...filteredItem]);
        setShowLoader(false);
      }
    }
  };

  const handleOnAdd = () => {
    if (selectedUnits.length > 0) {
      onUnitSelect(selectedUnits);
    }
  };

  return (
    <>
      {/* {JSON.stringify(selectedIds)} */}
      <Box
        sx={{
          width: "100%",
          typography: "body1",
        }}
      >
        <div className="u-tree-view11">
          <Backdrop
            sx={(theme) => ({
              color: "#fff",
              zIndex: theme.zIndex.drawer + 1,
            })}
            open={showLoader}
          >
            <CircularProgress color="inherit"></CircularProgress>
          </Backdrop>
          {folder && folder.length > 0 && (
            <div className="u-tree-view">
              <TreeView
                data={folder}
                key={"unit-tree-view"}
                aria-label="Checkbox tree"
                multiSelect={true}
                propagateSelect={false}
                selectedIds={selectedIds}
                //onLoadData={onExpandUnit}
                nodeRenderer={({
                  element,
                  isBranch,
                  isExpanded,
                  getNodeProps,
                  level,
                  handleExpand,
                  handleSelect,
                  isHalfSelected,
                  isSelected,
                }: any) => {
                  const branchNode = (
                    isExpanded: boolean,
                    element: NodeData
                  ) => {
                    return isExpanded && !folderLoaded[element.id] ? (
                      <span
                        aria-hidden={true}
                        className="spinner-border spinner-border-sm align-middle ms-2 loading-icon"
                      ></span>
                    ) : (
                      <span
                        {...getNodeProps({
                          onClick: (e) => {
                            //alert(JSON.stringify(element));
                            handleExpand(e);
                          },
                        })}
                        className="px-3"
                        style={{ float: "left" }}
                      >
                        <ArrowIcon isOpen={isExpanded} className={""} />
                      </span>
                    );
                  };
                  return (
                    <>
                      {element.id > 0 && (
                        <div
                          key={"unit-tree-node-" + element.id}
                          className={cx("tree-node", {
                            selected: isSelected,
                          })}
                          style={{ marginRight: 35 * (level - 1) }}
                        >
                          <span className="tree-view-item  treeview-category px-0 py-2">
                            {isBranch && branchNode(isExpanded, element)}

                            <span
                              {...getNodeProps({
                                onClick: (e) => {
                                  //handleSelect(e);
                                  e.stopPropagation();
                                },
                              })}
                              className="px-3"
                            >
                              <FancyCheckbox
                                label=""
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(
                                    element,
                                    e.target.checked
                                  );
                                }}
                              />
                            </span>
                            <span
                              {...getNodeProps({
                                onClick: (e) => {
                                  handleExpand(e);
                                },
                              })}
                              className="px-3"
                            >
                              {/* <span>
                                {element.name} - {element.id}-
                                {element.rootParentName}
                              </span> */}
                              <DetailLabels style={{}} text={element.name} />{" "}
                              {errors[element.id] && (
                                <span
                                  className="px-5"
                                  style={{
                                    color: "red",
                                    float: "left",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    color={""}
                                    size="lg"
                                    icon={faXmark}
                                  />
                                  {errors[element.id]}
                                </span>
                              )}
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  );
                }}
              />
            </div>
          )}
        </div>
      </Box>
      {selectedIds && selectedIds.length > 0 && (
        <div className="row">
          <div className="col-xl-12 d-flex justify-content-end">
            <button className="btn MOD_btn btn-create" onClick={handleOnAdd}>
              <BtnLabeltxtMedium2 text={"BUTTON.LABEL.ADD"} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
