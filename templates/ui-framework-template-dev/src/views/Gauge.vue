<template>
  <div>
    <div class="moz-frame">
      <moz-controller></moz-controller>
      <moz-split-box
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height)"
        :boxes="[
          { type: 'rate', size: 1, minWidth: 200 },
          { type: 'rate', size: 1, minWidth: 200 },
          { type: 'rate', size: 1, minWidth: 200 },
        ]"
        horizontal
        resizable
      >
        <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
          <moz-split-box
            :width="parentsWidth"
            :height="parentsHeight"
            :boxes="[
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
            ]"
            resizable
          >
            <template slot="box1">
              <moz-gauge :width="300" :height="30" :cornerRadius="15">
                <moz-bar :value="50" name="사용률" />
              </moz-gauge>
            </template>
            <template slot="box2">
              <moz-gauge :width="300" :height="30" :colorHash="textPosColorHash">
                <moz-bar :value="50" name="start" percentText="%" />
              </moz-gauge>
            </template>
            <template slot="box3">
              <moz-gauge :width="300" :height="30" :colorHash="textPosColorHash">
                <moz-bar :value="50" name="middle" labelType="middle" percentText="%" />
              </moz-gauge>
            </template>
            <template slot="box4">
              <moz-gauge :width="300" :height="30" :colorHash="textPosColorHash">
                <moz-bar :value="50" name="end" labelType="end" percentText="%" />
              </moz-gauge>
            </template>
            <template slot="box5">
              <moz-gauge :width="300" :height="30" :colorHash="textPosColorHash">
                <moz-bar :value="50" name="inner" labelType="inner" percentText="%" />
              </moz-gauge>
            </template>
            <template slot="box6">
              <moz-gauge :width="300" :height="30" :colorHash="textPosColorHash">
                <moz-bar :value="50" name="outer" labelType="outer" percentText="%" />
              </moz-gauge>
            </template>
            <template slot="box7">
              <moz-gauge :width="300" :height="30">
                <moz-bar :value="70" name="target" color="#FDD5D8" labelType="outer" />
                <moz-bar
                  :value="20"
                  name="current"
                  color="#f58991"
                  labelType="outer"
                  :animationDelay="1500"
                />
              </moz-gauge>
            </template>
            <template slot="box8">
              <moz-gauge :width="300" :height="30">
                <moz-bar :value="80" name="target" color="#d0dbef" labelType="inner" />
                <moz-bar
                  :value="50"
                  name="old"
                  color="#a9bce0"
                  labelType="inner"
                  :animationDelay="1500"
                />
                <moz-bar
                  :value="20"
                  name="new"
                  color="#617db2"
                  labelType="inner"
                  :animationDelay="2500"
                />
              </moz-gauge>
            </template>
            <template slot="box9">
              <moz-gauge :width="300" :height="30">
                <moz-bar :value="100" name="진행률" />
                <moz-mark type="tick" />
              </moz-gauge>
            </template>
            <template slot="box10">
              <moz-gauge :width="300" :height="30">
                <moz-bar :value="50" name="진행률" />
                <moz-mark :value="30" name="최소 목표" dashArray="8, 5" />
                <moz-mark :value="70" name="목표" dashArray="8, 5" />
              </moz-gauge>
            </template>
            <template slot="box11">
              <moz-gauge :width="300" :height="30" :setToolTip="setToolTip">
                <moz-bar
                  :value="70"
                  name="사용률"
                  color="#B7F0D2"
                  endColor="#3eb776"
                  :gradient="true"
                  labelType="inner"
                />
              </moz-gauge>
            </template>
            <template slot="box12">
              <moz-gauge :width="300" :height="30" noDataText="No Data!">
                <moz-bar :value="50" name="사용률" />
              </moz-gauge>
            </template>
          </moz-split-box>
        </template>
        <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
          <moz-split-box
            :width="parentsWidth"
            :height="parentsHeight"
            :boxes="[
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
            ]"
            resizable
            horizontal
          >
            <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
              <moz-split-box
                :width="parentsWidth"
                :height="parentsHeight"
                :boxes="[
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                ]"
                resizable
              >
                <template slot="box1">
                  <moz-gauge :width="200" :height="200" type="arc" :cornerRadius="10">
                    <moz-arc
                      :value="changeValue"
                      :animationDuration="0"
                      :animationDelay="0"
                      name="사용률"
                    />
                  </moz-gauge>
                </template>
                <template slot="box2">
                  <moz-gauge :width="200" :height="200" type="arc" :colorHash="textPosColorHash">
                    <moz-arc
                      :value="50"
                      name="middle"
                      labelType="middle"
                      percentText="%"
                      :textSize="20"
                    />
                  </moz-gauge>
                </template>
                <template slot="box3">
                  <moz-gauge :width="200" :height="200" type="arc" :colorHash="textPosColorHash">
                    <moz-arc :value="50" name="inner" labelType="inner" percentText="%" />
                  </moz-gauge>
                </template>
                <template slot="box4">
                  <moz-gauge :width="200" :height="200" type="arc" :colorHash="textPosColorHash">
                    <moz-arc :value="50" name="outer" labelType="outer" percentText="%" />
                  </moz-gauge>
                </template>
              </moz-split-box>
            </template>
            <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
              <moz-split-box
                :width="parentsWidth"
                :height="parentsHeight"
                :boxes="[
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                ]"
                resizable
              >
                <template slot="box1">
                  <moz-gauge :width="200" :height="200" type="arc">
                    <moz-arc :value="70" name="target" color="#FDD5D8" labelType="outer" />
                    <moz-arc
                      :value="20"
                      name="current"
                      color="#f58991"
                      labelType="outer"
                      :animationDelay="1500"
                    />
                  </moz-gauge>
                </template>
                <template slot="box2">
                  <moz-gauge :width="200" :height="200" type="arc">
                    <moz-arc :value="80" name="target" color="#d0dbef" labelType="inner" />
                    <moz-arc
                      :value="50"
                      name="old"
                      color="#a9bce0"
                      labelType="inner"
                      :animationDelay="1500"
                    />
                    <moz-arc
                      :value="20"
                      name="new"
                      color="#617db2"
                      labelType="inner"
                      :animationDelay="2500"
                    />
                  </moz-gauge>
                </template>
                <template slot="box3">
                  <moz-gauge :width="200" :height="200" type="arc">
                    <moz-arc :value="100" name="진행률" />
                    <moz-mark type="tick" />
                  </moz-gauge>
                </template>
                <template slot="box4">
                  <moz-gauge :width="200" :height="200" type="arc">
                    <moz-arc :value="50" name="진행률" />
                    <moz-mark :value="30" name="최소 목표" dashArray="8, 5" />
                    <moz-mark :value="70" name="목표" dashArray="8, 5" />
                  </moz-gauge>
                </template>
              </moz-split-box>
            </template>
          </moz-split-box>
        </template>
        <template slot="box3" slot-scope="{ parentsHeight, parentsWidth }">
          <moz-split-box
            :width="parentsWidth"
            :height="parentsHeight"
            :boxes="[
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
            ]"
            resizable
            horizontal
          >
            <template slot="box1">
              <moz-split-box
                :width="parentsWidth"
                :height="parentsHeight"
                :boxes="[
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                ]"
                resizable
              >
                <template slot="box1">
                  <moz-gauge
                    :width="200"
                    :height="200"
                    type="arc"
                    :cornerRadius="10"
                    :setToolTip="setToolTip"
                  >
                    <moz-arc
                      :value="70"
                      name="사용률"
                      color="#B7F0D2"
                      endColor="#3eb776"
                      :gradient="true"
                      labelType="inner"
                    />
                  </moz-gauge>
                </template>
                <template slot="box2">
                  <moz-gauge
                    :width="200"
                    :height="200"
                    type="arc"
                    :startAngle="-135"
                    :endAngle="135"
                  >
                    <moz-arc
                      :value="70"
                      name="사용률"
                      color="#f0baec"
                      :textSize="20"
                      percentText="%"
                    />
                    <moz-mark type="tick" :ticks="10" />
                  </moz-gauge>
                </template>
                <template slot="box3">
                  <moz-gauge
                    :width="200"
                    :height="200"
                    type="arc"
                    :cornerRadius="10"
                    :reverse="true"
                  >
                    <moz-arc :value="50" name="사용률" />
                  </moz-gauge>
                </template>
                <template slot="box4">
                  <moz-gauge :width="200" :height="200" type="arc" :reverse="true">
                    <moz-arc :value="70" name="target" color="#FDD5D8" labelType="outer" />
                    <moz-arc
                      :value="20"
                      name="current"
                      color="#f58991"
                      labelType="outer"
                      :animationDelay="1500"
                    />
                  </moz-gauge>
                </template>
              </moz-split-box>
            </template>
            <template slot="box2">
              <moz-split-box
                :width="parentsWidth"
                :height="parentsHeight"
                :boxes="[
                  { type: 'rate', size: 1, minWidth: 200 },
                  { type: 'rate', size: 1, minWidth: 200 },
                ]"
                resizable
              >
                <template slot="box1">
                  <moz-gauge
                    :width="200"
                    :height="100"
                    type="arc"
                    :startAngle="-90"
                    :endAngle="90"
                    :verticalPosition="50"
                  >
                    <moz-arc :value="50" name="사용률" :textVerticalPosition="-20" />
                  </moz-gauge>
                </template>
                <template slot="box2">
                  <moz-gauge
                    :width="200"
                    :height="100"
                    type="arc"
                    :startAngle="-90"
                    :endAngle="90"
                    :verticalPosition="50"
                  >
                    <moz-arc
                      :value="70"
                      name="사용률"
                      color="#9cc6f0"
                      :textVerticalPosition="-20"
                      percentText="%"
                    />
                    <moz-mark type="tick" />
                  </moz-gauge>
                </template>
              </moz-split-box>
            </template>
          </moz-split-box>
        </template>
      </moz-split-box>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { IGaugeTooltipParams } from "mozart-common";

@Component({
  components: {},
})
export default class Gauge extends Vue {
  public changeValue: number = 50;

  constructor() {
    super();
  }

  public mounted() {
    setInterval(() => {
      if (this.changeValue === 50) {
        this.changeValue = 25;
      } else if (this.changeValue === 25) {
        this.changeValue = 75;
      } else {
        this.changeValue = 50;
      }
    }, 2000);
  }

  public textPosColorHash: Record<string, any> = {};
  public setToolTip(params: IGaugeTooltipParams) {
    return `<div>통과: 20</div>
      <div>실패: 1</div>
      <div>미수행: 0</div>`;
  }
}
</script>
