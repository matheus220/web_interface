import React, { Component } from "react";
import { Polyline, withLeaflet } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

class PolylineDecorator extends Component {
  constructor(props) {
    super(props);
    this.polyRef = React.createRef();
  }
  componentDidMount() {
    const polyline = this.polyRef.current.leafletElement; //get native Leaflet polyline
    const { map } = this.polyRef.current.props.leaflet; //get native Leaflet map

    L.polylineDecorator(polyline, {
      patterns: this.props.patterns
    }).addTo(map);
  }

  render() {
    return <Polyline ref={this.polyRef} {...this.props} />;
  }
}

export default withLeaflet(PolylineDecorator);