import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket,
  faCircleInfo,
  faSearch,
  faLock,
  faCircleExclamation,
  faXmark,
  faCircleMinus,
  faAngleUp,
  faAngleDown,
  faArrowUpRightFromSquare,
  faInfo,
  faPaperclip,
  faLink,
  faDownload,
  faRemove,
  faX,
  faCaretRight,
  faCaretLeft,
  faForwardStep,
  faForwardFast,
  faBackwardStep,
  faBackwardFast,
  faTableCells,
  faTh,
  faBorderAll,
  faGrip,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import {
  faEdit,
  faPlusSquare,
  faUser,
  faTrashCan,
  faXmarkCircle,
  faClock,
  faCircle,
  faClockFour,
  faCheckCircle,
  faFloppyDisk,
  faEye,
  faEyeSlash,
  faCircleDot,
  faHand,
  faFolder,
  faFile,
  faCommentDots,
} from "@fortawesome/free-regular-svg-icons";
import {
  IconLookup,
  SizeProp,
  findIconDefinition,
} from "@fortawesome/fontawesome-svg-core";

function getFontAwsomeObject(name: string) {
  const nullIcone: IconLookup = { prefix: "fab", iconName: "empty-set" };
  switch (name) {
    case "faSearch":
      return faSearch;
    case "faClock":
      return faClock;
    case "faEdit":
      return faEdit;
    case "faLock":
      return faLock;
    case "faCircleExclamation":
      return faCircleExclamation;
    case "faCircle":
      return faCircle;
    case "faCircleMinus":
      return faCircleMinus;
    case "arrowUp":
      return faAngleUp;
    case "arrowDown":
      return faAngleDown;
    case "faFloppyDisk":
      return faFloppyDisk;
    case "faCheckCircle":
      return faCheckCircle;
    case "faClockFour":
      return faClockFour;
    case "faArrowUpRightFromSquare":
      return faArrowUpRightFromSquare;
    case "faEye":
      return faEye;
    case "faInfo":
      return faInfo;
    case "faCircleInfo":
      return faCircleInfo;
    case "faEyeSlash":
      return faEyeSlash;
    case "faCircleDot":
      return faCircleDot;
    case "faPaperclip":
      return faPaperclip;
    case "faXmarkCircle":
      return faXmarkCircle;
    case "faXmark":
      return faXmark;
    case "faHand":
      return faHand;
    case "faLink":
      return faLink;
    case "faDownload":
      return faDownload;
    case "faFolder":
      return faFolder;
    case "faFile":
      return faFile;
    case "faRemove":
      return faRemove;
    case "reject":
      return faX;
    case "trash":
      return faTrashCan;
    case "user":
      return faUser;
    case "edit":
      return faEdit;
    case "add":
      return faPlusSquare;
    case "forwardStep":
      return faForwardStep;
    case "forwardFast":
      return faForwardFast;
    case "backwardStep":
      return faBackwardStep;
    case "backwardFast":
      return faBackwardFast;
    case "caretRight":
      return faCaretRight;
    case "caretLeft":
      return faCaretLeft;
    case "ticket":
      return faTicket;
    case "faGrid":
      return faTh;
    case "faFileLines":
      return faFileLines;
    case "faCommentDots":
      return faCommentDots;
    default:
      return findIconDefinition(nullIcone);
  }
}

function RenderFontAwesome(props: {
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
  marginInlineStart?: string;
  marginInlineEnd?: string;
  marginBottom?: string;
  color?: string;
  display: boolean;
  icon: string;
  size: SizeProp;
  flip?: "horizontal" | "vertical" | "both";
  cursor?: string;
}) {
  if (props.display)
    return props.flip && props.flip != "both" ? (
      <FontAwesomeIcon
        color={props.color}
        flip={props.flip}
        icon={getFontAwsomeObject(props.icon)}
        size={props.size}
        style={{
          color: props.color,
          marginRight: props.marginRight,
          marginLeft: props.marginLeft,
          marginTop: props.marginTop,
          marginInlineStart: props.marginInlineStart,
          marginInlineEnd: props.marginInlineEnd,
          marginBottom: props.marginBottom,
          cursor: props.cursor,
        }}
      />
    ) : (
      <FontAwesomeIcon
        color={props.color}
        icon={getFontAwsomeObject(props.icon)}
        size={props.size}
        style={{
          color: props.color,
          marginRight: props.marginRight,
          marginLeft: props.marginLeft,
          marginTop: props.marginTop,
          marginInlineStart: props.marginInlineStart,
          marginInlineEnd: props.marginInlineEnd,
          marginBottom: props.marginBottom,
          cursor: props.cursor,
        }}
      />
    );
  else return <></>;
}

export default RenderFontAwesome;
