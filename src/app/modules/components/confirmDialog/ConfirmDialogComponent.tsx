import * as React from "react";

import Backdrop from "@mui/material/Backdrop";

import Modal from "@mui/material/Modal";

import Fade from "@mui/material/Fade";

import "./modal-dialog.css";
import alerttriangle from "../../../../_metronic/assets/images/alerttriangle.png"; 

export default function ConfirmDialogComponent(props) {
  const { content, onOk, onClose } = props;

  const [open, setOpen] = React.useState(true);

  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition={true}
        onBackdropClick={onClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div
            className="modal fade show"
            id="myModalConfirm"
            style={{ display: "block" }}
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="confirm modal-body p-3">
                  <div style={{textAlign:"center"}} className="pt-5">
                    <img
                      src={alerttriangle}
                      alt=""
                      style={{ width: "15%", height: "35%" }}
                    ></img>
                  </div>

                  {/* <h2 className="text-center pt-2">Confirmation</h2> */}

                  <p className="dialog-content">{content}</p>

                  <div>
                    <div className="btn-section" style={{textAlign:"center"}}>
                      <button className="btn btn-No" onClick={onClose}>
                        No
                      </button>
                        &nbsp;  &nbsp;  &nbsp;
                      <button className="btn btn-OK w-10 pl-5 mx-3" onClick={onOk}>
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

/* <Fade in={open}>

          <Box sx={style}>

            <div className="text-center">

              <div className="icon">

                <img src={imgSrc} alt="" style={{ width: "25%" }}></img>

              </div>

              <div className="success">

                <h1>Confirmation</h1>

                <p>{content}</p>

              </div>

 

              <div className="bttn">

                <button

                  className="btn text-white mr-5 btn-no"

                  type="button"

                  onClick={onClose}

                >

                  NO

                </button>

                <button className="btn text-white" type="button" onClick={onOk}>

                  YES

                </button>

              </div>

            </div>

          </Box>

        </Fade> */

/* </Modal>

    </div> */

/* <div className="modal fade show" id="myModalConfirm" style={{ display: "block" }} aria-modal="true" role="dialog">

    <div className="modal-dialog modal-dialog-centered ">

      <div className="modal-content">

  

        

        <div className="confirm modal-body p-5">

        <center>  <img src="icons/Confirmation.svg" alt=""></img></center>

 

        <h2 className="text-center pt-3">Confirmation</h2>

        <p className="text-center pt-1">Are you sure want to submit IT request form ?</p>

 

        <center><button className="btn btn-light mt-4 fs-6 btn-lg pt-2 pb-2 ps-4 pe-4 me-4">No</button> <button className="btn btn-success mt-4 fs-6 btn-lg pt-2 pb-2 ps-4 pe-4">Yes</button></center>

        </div>

      </div>

    </div>

  </div> */
