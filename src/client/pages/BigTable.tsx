import React from "react";
import NewDepartmentTable from "../../admin/components/Table/NewDepartmentTable.tsx";
import { Button, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const BigTablePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div>
      <Box sx={{ mt: 2 }}>
        <NewDepartmentTable />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
            mr: 2,
            pb: 2
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            sx={{
              bgcolor: "#ff3b30",
              "&:hover": {
                bgcolor: "#e63946",
              },
              textTransform: "none",
            }}
          >
            <Typography sx={{ color: "white" }}>{t("logout")}</Typography>
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default BigTablePage;
