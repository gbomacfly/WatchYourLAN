import About from "../components/Config/About"
import Basic from "../components/Config/Basic"
import Donate from "../components/Config/Donate"
import Influx from "../components/Config/Influx"
import Prometheus from "../components/Config/Prometheus"
import Scan from "../components/Config/Scan"

function Config() {

  return (
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <div class="space-y-4">
        <Basic></Basic>
        <Donate></Donate>
        <Scan></Scan>
      </div>
      <div class="space-y-4">
        <Influx></Influx>
        <Prometheus></Prometheus>
        <About></About>
      </div>
    </div>
  )
}

export default Config
