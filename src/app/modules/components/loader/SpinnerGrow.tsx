import { CircularProgress, Skeleton } from "@mui/material";
import "./SpinnerGrow.scss";

export const SpinnerGrow = (props) => {
  const { extraClass = "" } = props;

  return (
    <p className={`text-center ${extraClass}`}>
      <div className="spinner-grow" role="status"></div> 
       
      {/* <CircularProgress color="inherit" /> */}
    </p>
  //   <div className="loading loading01">
  //   <span>L</span>
  //   <span>o</span>
  //   <span>a</span>
  //   <span>d</span>
  //   <span>i</span>
  //   <span>n</span>
  //   <span>g</span>
  //   <span>.</span>
  //   <span>.</span>
  //   <span>.</span>
  // </div>
  );
};
