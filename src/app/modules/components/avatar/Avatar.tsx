import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { IUsers } from '../../../models/global/userModel';


interface IAvatar {
    avatarData : IUsers[];   
  };

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: "#dfcfb6",
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  }
  

export default function GroupAvatars({avatarData} : IAvatar) {
  return (
    <>
   
       <AvatarGroup max={5} style={{ justifyContent: "left", display: "flex" }}>         
       { 
            avatarData &&
            avatarData.map(item => (  
                    <Avatar {...stringAvatar(item.userName)}></Avatar>        
            ))
        }
        </AvatarGroup>
    </>
  );
}