import React from "react";
import ReactJson from "react-json-view";
import { Scrollbars } from "react-custom-scrollbars-2";

import "./DataViewer.css";

const DataViewer = ({ data }: { data: any}) => (
  <div className="dataViewer">
    <Scrollbars autoHide>
      <div className="dataContent" >
        <ReactJson
          collapsed={true}
          name={false}
          src={data}
        />
      </div>
    </Scrollbars>
  </div>
);

export default DataViewer;