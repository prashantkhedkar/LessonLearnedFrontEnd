import React from "react";
import { useIntl } from "react-intl";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const NoSearchResultsFound = ({}) => {
  const intl = useIntl();

  return (
    <>
      <div data-kt-search-element="empty" className="text-center     w-100">
        <div className="pt-10 pb-5">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size="5x"
            color="#afaba4"
          ></FontAwesomeIcon>
        </div>

        <div className="pb-15 fw-bold">
          <h3 className="text-gray-600 fs-5 mb-2">
            {intl.formatMessage({ id: "SEARCH.NORESULTFOUND" })}
          </h3>
          {/* <div className="text-muted fs-7">
            {intl.formatMessage({ id: "SEARCH.TRYGAIN" })}
          </div> */}
        </div>
      </div>
    </>
  );
};
