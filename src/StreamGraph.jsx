import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StreamGraph = ({ data }) => {
  const svgRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };

    const keys = Object.keys(data[0]).filter((key) => key !== "Date");

    const xScale = d3.scaleTime().domain(d3.extent(data, (d) => d.Date)).range([0, width]);

    const yScale = d3.scaleLinear().range([height, 0]);

    const colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeCategory10);

    const stack = d3.stack().keys(keys);
    const stackedData = stack(data);

    yScale.domain([
      0,
      d3.max(stackedData, (layer) =>
        d3.max(layer, (d) => d[1])
      ),
    ]);

    const area = d3
      .area()
      .curve(d3.curveBasis)
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const graphGroup = svg.append("g");

    graphGroup
      .selectAll(".layer")
      .data(stackedData)
      .join("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d) => colorScale(d.key))
      .on("mousemove", (event, d) => {
        const tooltip = d3.select(".tooltip");

        const containerBounds = svgRef.current.getBoundingClientRect();
        const tooltipX = event.clientX - containerBounds.left + 10;
        const tooltipY = event.clientY - containerBounds.top + 10;

        tooltip
          .style("opacity", 1)
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`);

        tooltip.select(".tooltip-label").text(d.key);

        const tooltipSvg = tooltip.select("svg");
        const tooltipWidth = 200;
        const tooltipHeight = 100;

        const miniXScale = d3.scaleBand().domain(data.map((d) => d.Date)).range([0, tooltipWidth]).padding(0.1);

        const miniYScale = d3.scaleLinear().domain([0, d3.max(data, (item) => item[d.key])]).range([tooltipHeight, 0]);

        tooltipSvg.selectAll("*").remove();

        tooltipSvg
          .selectAll(".bar")
          .data(data)
          .join("rect")
          .attr("class", "bar")
          .attr("x", (item) => miniXScale(item.Date))
          .attr("y", (item) => miniYScale(item[d.key]))
          .attr("width", miniXScale.bandwidth())
          .attr("height", (item) => tooltipHeight - miniYScale(item[d.key]))
          .attr("fill", colorScale(d.key));

        tooltipSvg
          .append("g")
          .attr("transform", `translate(0,${tooltipHeight})`)
          .call(
            d3.axisBottom(miniXScale)
              .tickFormat(d3.timeFormat("%b"))
              .ticks(5)
          )
          .call((g) => g.selectAll("text").style("font-size", "10px"));

        tooltipSvg
          .append("text")
          .attr("x", tooltipWidth / 2)
          .attr("y", tooltipHeight + 30)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .text("Time");

        tooltipSvg
          .append("g")
          .call(d3.axisLeft(miniYScale).ticks(3))
          .call((g) => g.selectAll("text").style("font-size", "10px"));

        tooltipSvg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -tooltipHeight / 2)
          .attr("y", -30)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .text("Hashtag Count");
      })
      .on("mouseout", () => {
        d3.select(".tooltip").style("opacity", 0);
      });

    graphGroup
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    graphGroup.append("g").call(d3.axisLeft(yScale));

    const legend = d3.select(legendRef.current);
    legend.selectAll("*").remove();

    const legendItems = legend
      .selectAll(".legend-item")
      .data(keys)
      .join("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "5px");

    legendItems
      .append("div")
      .style("width", "15px")
      .style("height", "15px")
      .style("background-color", (d) => colorScale(d))
      .style("margin-right", "8px");

    legendItems.append("span").text((d) => d);
  }, [data]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <svg ref={svgRef}></svg>
        <div
          className="tooltip"
          style={{
            opacity: 0,
            position: "absolute",
            pointerEvents: "none",
            backgroundColor: "white",
            color: "black",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            className="tooltip-label"
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              textAlign: "center",
            }}
          ></div>
          <svg
            style={{
              width: "200px",
              height: "100px",
            }}
          ></svg>
        </div>
      </div>
      <div
        ref={legendRef}
        style={{
          width: "200px",
          marginLeft: "20px",
          fontSize: "14px",
          fontFamily: "Arial, sans-serif",
        }}
      ></div>
    </div>
  );
};

export default StreamGraph;
