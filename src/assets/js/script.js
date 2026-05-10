import {useState} from 'react'
// import * as bootstrap from 'bootstrap';
// import allImages from '../images-import';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';



//navbar opening and closing functionality

const handlenavbar = () => {
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  if (window.innerWidth < 768) {
    if (!bodyElement.classList.contains('vertical-sidebar-enable')) {
      bodyElement.classList.add('vertical-sidebar-enable');
    }else{
      bodyElement.classList.remove('vertical-sidebar-enable');
    }
  } else {
    bodyElement.classList.remove('vertical-sidebar-enable');
    if (htmlElement.getAttribute('data-sidebar-size') === 'lg') {
      htmlElement.setAttribute('data-sidebar-size', 'sm');
    } else {
      htmlElement.setAttribute('data-sidebar-size', 'lg');
    }
  }
};


export const useNavbarToggle = () => {
  const [isClass, setIsClass] = useState(false);
  const handlenavbarClick = () => {
    handlenavbar();
    setIsClass((currentStatus) => !currentStatus);
  };
  return {
    handlenavbarClick,
    isClass,
  };
}

// pagination code for page group component and page master component

export const paginateData = (data, currentPage, entriesPerPage) => {
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  return data.slice(indexOfFirstEntry, indexOfLastEntry);
};

export const calculateTotalPages = (dataLength, entriesPerPage) => {
  return Math.ceil(dataLength / entriesPerPage);
};


export const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));