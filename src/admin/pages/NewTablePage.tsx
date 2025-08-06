import React from 'react';
import NewDepartmentTable from '../components/Table/NewDepartmentTable.tsx';

const NewTablePage = () => {
  return (
    <div className="container">
      <NewDepartmentTable mode="admin" />
    </div>
  );
};

export default NewTablePage;