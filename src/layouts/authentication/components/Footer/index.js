import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ light }) {
  return (
    <MDBox position="absolute" width="100%" bottom={0} py={4}>
      <MDBox width="100%" display="flex" justifyContent="center" alignItems="center" px={1.5}>
        <MDTypography variant="button" fontWeight="regular" color={light ? "white" : "text"}>
          &copy; {new Date().getFullYear()} ChegouApp
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

Footer.defaultProps = {
  light: false,
};

Footer.propTypes = {
  light: PropTypes.bool,
};

export default Footer;
