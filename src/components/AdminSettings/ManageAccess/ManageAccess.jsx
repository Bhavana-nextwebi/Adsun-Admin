import React from 'react';
import { useParams } from 'react-router-dom';
import ComponentHeader from '../../Common/OtherElements/ComponentHeader';
export const ManageAccess = () => {
const {roleName} = useParams();
  return (
    <>
      <ComponentHeader title={`Manage Access - ${roleName}`}/>
    </>
  );
};
