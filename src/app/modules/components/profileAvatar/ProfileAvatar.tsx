import React, { useEffect, useState } from "react";
import "./ProfileAvatar.css";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  getEmployeePhotoFromMod,
  globalActions,
} from "../../services/globalSlice";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import { getProfileIconByGender } from "../../utils/common";

const ProfileAvatar = ({ name }) => {
  const nameParts = String(name).split(" ");
  const firstNameInitial = nameParts[0] ? nameParts[0][0] : "";
  const lastNameInitial = nameParts[1] ? nameParts[1][0] : "";
  const { profileAvatar } = useAppSelector((s) => s.globalgeneric);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!profileAvatar || profileAvatar === "") {
      dispatch(getEmployeePhotoFromMod())
        .then((base64String) => {
          if (base64String.payload.error) {
            // Error
          } else {
            var output = base64String.payload;

            const blob = new Blob([output]);

            // Create object URL
            const url = URL.createObjectURL(blob);

            dispatch(globalActions.updateProfileAvatar(url));

            // Clean up object URL when component unmounts
            return () => URL.revokeObjectURL(url);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
        });
    }
  }, []);

  return (
    <span className="user-profile-image">
      {profileAvatar && (
        <img
          src={profileAvatar}
          alt="Employee Photo"
          className="user-profile-image"
        />
      )}
      {!profileAvatar && (
        <img
          src={"/" + getProfileIconByGender()}
          alt="Employee Photo"
          className="user-profile-image"
        />
      )}
    </span>
  );
};

export default ProfileAvatar;
