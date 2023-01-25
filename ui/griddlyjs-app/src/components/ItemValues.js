import React from "react";

const ItemValues = ({ session, goalImages }) => {
  return (
    <div className="item-values-container">
      {session &&
        goalImages &&
        session.utility.goals.map((r, i) => (
          <div className="item-values-element">
            <img src={`resources/images/${goalImages[i]}`} height="40px" />
            <span
              style={
                r === 50
                  ? { color: "rgb(90, 90, 90)", fontWeight: "bold" }
                  : { color: "grey", fontWeight: "normal" }
              }
            >
              {i <= 2 ? r : "?"}
            </span>
          </div>
        ))}
    </div>
  );
};

export default ItemValues;
