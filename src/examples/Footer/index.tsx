import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ company }) {
  const { name } = company;

  return (
    <MDBox width="100%" display="block" px={1.5} py={2}>
      <MDBox display="flex" justifyContent="center" alignItems="center" color="text">
        <MDTypography variant="button" fontWeight="regular" color="text">
          &copy; {new Date().getFullYear()} {name}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

Footer.defaultProps = {
  company: { name: "ChegouApp" },
};

Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
};

export default Footer;
