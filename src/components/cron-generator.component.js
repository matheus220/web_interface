import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';

const CheckboxGroup = props => (
    <div className="checkbox-group">
        <input type="checkbox" id={props.id} name={props.name} value={props.value} defaultChecked={props.checked ? true : false} />
        <label style={props.style} htmlFor={props.id}>{props.label}</label>
    </div>
)

export default class Cron extends Component {

    constructor(props) {
        super(props);
        this.state = {
            result: '0 0 0 ? * * *'
        }
        this.cronChange = this.cronChange.bind(this);
        this._onChange = this._onChange.bind(this);
    }

    _onChange(result) {
        if(typeof this.props.onCronChange === "function") {
            this.props.onCronChange(result);
        }
    }

    cronChange() {
        $(this).parents('.cron-option').children('input[type="radio"]').attr("checked", "checked");

        var day = this.day()
        var seconds = this.seconds();
		var minutes = this.minutes();
		var hours = this.hours();
        var dom = day[0];
        var dow = day[1];
		var month = this.month();
        var year = this.year();
        var result = seconds + ' ' + minutes + ' ' + hours + ' ' + dom + ' ' + month + ' ' + dow;
        
        this._onChange(result);
        
        this.setState({
            result: result
        });
    }

    componentDidMount(){
        $('#crontabs input, #crontabs select').change(this.cronChange);
    }

    seconds() {
        var seconds = '';
        if ($('#cronEverySecond:checked').length) {
            seconds = '*';
        } else if ($('#cronSecondIncrement:checked').length) {
            seconds = $('#cronSecondIncrementStart').val();
            seconds += '/';
            seconds += $('#cronSecondIncrementIncrement').val();
        } else if ($('#cronSecondSpecific:checked').length) {
            $('[name="cronSecondSpecificSpecific"]:checked').each(function (i, chck) {
                seconds += $(chck).val();
                seconds += ',';
            });
            if (seconds === '') {
                seconds = '0';
            } else {
                seconds = seconds.slice(0, -1);
            }
        } else {
            seconds = $('#cronSecondRangeStart').val();
            seconds += '-';
            seconds += $('#cronSecondRangeEnd').val();
        }
        return seconds;
    }

    minutes() {
        var minutes = '';
		if ($('#cronEveryMinute:checked').length) {
			minutes = '*';
		} else if ($('#cronMinuteIncrement:checked').length) {
			minutes = $('#cronMinuteIncrementStart').val();
			minutes += '/';
			minutes += $('#cronMinuteIncrementIncrement').val();
		} else if ($('#cronMinuteSpecific:checked').length) {
			$('[name="cronMinuteSpecificSpecific"]:checked').each(function (i, chck) {
				minutes += $(chck).val();
				minutes += ',';
			});
			if (minutes === '') {
				minutes = '0';
			} else {
				minutes = minutes.slice(0, -1);
			}
		} else {
			minutes = $('#cronMinuteRangeStart').val();
			minutes += '-';
			minutes += $('#cronMinuteRangeEnd').val();
        }
        return minutes;
    }

    hours() {
        var hours = '';
		if ($('#cronEveryHour:checked').length) {
			hours = '*';
		} else if ($('#cronHourIncrement:checked').length) {
			hours = $('#cronHourIncrementStart').val();
			hours += '/';
			hours += $('#cronHourIncrementIncrement').val();
		} else if ($('#cronHourSpecific:checked').length) {
			$('[name="cronHourSpecificSpecific"]:checked').each(function (i, chck) {
				hours += $(chck).val();
				hours += ',';
			});
			if (hours === '') {
				hours = '0';
			} else {
				hours = hours.slice(0, -1);
			}
		} else {
			hours = $('#cronHourRangeStart').val();
			hours += '-';
			hours += $('#cronHourRangeEnd').val();
		}
        return hours;
    }

    day() {
        var dow = '';
		var dom = '';

		if ($('#cronEveryDay:checked').length) {
			dow = '*';
			dom = '?';
		} else if ($('#cronDowIncrement:checked').length) {
			dow = $('#cronDowIncrementStart').val();
			dow += '/';
			dow += $('#cronDowIncrementIncrement').val();
			dom = '?';
		} else if ($('#cronDomIncrement:checked').length) {
			dom = $('#cronDomIncrementStart').val();
			dom += '/';
			dom += $('#cronDomIncrementIncrement').val();
			dow = '?';
		} else if ($('#cronDowSpecific:checked').length) {
			dom = '?';
			$('[name="cronDowSpecificSpecific"]:checked').each(function (i, chck) {
				dow += $(chck).val();
				dow += ',';
			});
			if (dow === '') {
				dow = 'SUN';
			} else {
				dow = dow.slice(0, -1);
			}
		} else if ($('#cronDomSpecific:checked').length) {
			dow = '?';
			$('[name="cronDomSpecificSpecific"]:checked').each(function (i, chck) {
				dom += $(chck).val();
				dom += ',';
			});
			if (dom === '') {
				dom = '1';
			} else {
				dom = dom.slice(0, -1);
			}
		} else if ($('#cronLastDayOfMonth:checked').length) {
			dow = '?';
			dom = 'L';
		} else if ($('#cronLastWeekdayOfMonth:checked').length) {
			dow = '?';
			dom = 'LW';
		} else if ($('#cronLastSpecificDom:checked').length) {
			dom = '?';
			dow = $('#cronLastSpecificDomDay').val();
			dow += 'L';
		} else if ($('#cronDaysBeforeEom:checked').length) {
			dow = '?';
			dom = 'L-';
			dom += $('#cronDaysBeforeEomMinus').val();
		} else if ($('#cronNthDay:checked').length) {
			dom = '?';
			dow = $('#cronNthDayDay').val();
			dow += '#';
			dow += $('#cronNthDayNth').val();;
		}
        return([dom, dow]);
    }

    month() {
        var month = '';
		if ($('#cronEveryMonth:checked').length) {
			month = '*';
		} else if ($('#cronMonthIncrement:checked').length) {
			month = $('#cronMonthIncrementStart').val();
			month += '/';
			month += $('#cronMonthIncrementIncrement').val();
		} else if ($('#cronMonthSpecific:checked').length) {
			$('[name="cronMonthSpecificSpecific"]:checked').each(function (i, chck) {
				month += $(chck).val();
				month += ',';
			});
			if (month === '') {
				month = '1';
			} else {
				month = month.slice(0, -1);
			}
		} else {
			month = $('#cronMonthRangeStart').val();
			month += '-';
			month += $('#cronMonthRangeEnd').val();
		}
        return month;
    }

    year() {
        var year = '';
		if ($('#cronEveryYear:checked').length) {
			year = '*';
		} else if ($('#cronYearIncrement:checked').length) {
			year = $('#cronYearIncrementStart').val();
			year += '/';
			year += $('#cronYearIncrementIncrement').val();
		} else if ($('#cronYearSpecific:checked').length) {
			$('[name="cronYearSpecificSpecific"]:checked').each(function (i, chck) {
				year += $(chck).val();
				year += ',';
			});
			if (year === '') {
				year = '2016';
			} else {
				year = year.slice(0, -1);
			}
		} else {
			year = $('#cronYearRangeStart').val();
			year += '-';
			year += $('#cronYearRangeEnd').val();
		}
        return year;
    }

    checkboxGroup(start, end, name, idPrefix) {
        var slice = -2;
        if (start > 2000) slice = -4;

        var list = [];
        for (let i = start; i <= end; i++) {
            list.push(< CheckboxGroup key={i} id={idPrefix + i.toString()} name={name} value={i} label={('0' + i).slice(slice)} checked={i === start ? true : false} />);
        }
        return list;
    }

    listCheckboxGroup(labels, values, name, ids) {
        var list = [];
        for (let i = 0; i < labels.length; i++) {
            list.push(< CheckboxGroup key={ids[i]} id={ids[i]} name={name} value={values[i]} label={labels[i]} style={{minWidth: "91px"}} checked={i === 0 ? true : false} />);
        }
        return list;
    }

    render() {
        var dayOfWeekLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var dayOfWeekValues = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        var dayOfWeekIds = ["cronDowSun", "cronDowMon", "cronDowTue", "cronDowWed", "cronDowThu", "cronDowFri", "cronDowSat"];

        var monthsLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var monthsValues = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var monthsIds = ["cronMonth1", "cronMonth2", "cronMonth3", "cronMonth4", "cronMonth5", "cronMonth6", "cronMonth7", "cronMonth8", "cronMonth9", "cronMonth10", "cronMonth11", "cronMonth12"];

        return (
            <div id="crontabs">
                <Tabs defaultActiveKey="seconds" id="uncontrolled-tab-example">
                    <Tab eventKey="seconds" title="Seconds">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div>
                                <div className="cron-option">
                                    <input type="radio" id="cronEverySecond" name="cronSecond"/>
                                    <label htmlFor="cronEverySecond">Every second</label>
                                </div>
                                <div className="cron-option">
                                    <input type="radio" id="cronSecondIncrement" name="cronSecond"/>
                                    <label htmlFor="cronSecondIncrement">Every
                                        <select id="cronSecondIncrementIncrement" className="form-control-sm">
                                            <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option>
                                        </select>second(s) starting at second 
                                        <select id="cronSecondIncrementStart" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="cron-option">
                                    <input type="radio" id="cronSecondSpecific" defaultChecked={true} name="cronSecond"/>
                                    <label htmlFor="cronSecondSpecific">Specific second (choose one or many)</label>
                                    <div className="cron-select-group">
                                        <div className="d-flex flex-wrap">
                                            {this.checkboxGroup(0, 59, "cronSecondSpecificSpecific", "cronSecond")}
                                        </div>
                                    </div>
                                </div>
                                <div className="cron-option">
                                    <input type="radio" id="cronSecondRange" name="cronSecond"/>
                                    <label htmlFor="cronSecondRange">Every second between second
                                        <select id="cronSecondRangeStart" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                        and second 
                                        <select id="cronSecondRangeEnd" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="minutes" title="Minutes">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div>
                                <div className="cron-option">
                                    <input type="radio" id="cronEveryMinute" name="cronMinute"/>
                                    <label htmlFor="cronEveryMinute">Every minute</label>
                                </div>
                                <div className="cron-option">
                                    <input type="radio" id="cronMinuteIncrement" name="cronMinute"/>
                                    <label htmlFor="cronMinuteIncrement">Every
                                        <select id="cronMinuteIncrementIncrement" className="form-control-sm">
                                            <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option>
                                        </select> minute(s) starting at minute 
                                        <select id="cronMinuteIncrementStart" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="cron-option">
                                    <input type="radio" id="cronMinuteSpecific" defaultChecked={true} name="cronMinute"/>
                                    <label htmlFor="cronMinuteSpecific">Specific minute (choose one or many)</label>
                                    <div className="cron-select-group">
                                        <div className="d-flex flex-wrap">
                                            {this.checkboxGroup(0, 59, "cronMinuteSpecificSpecific", "cronMinute")}
                                        </div>
                                    </div>
                                    <div className="cron-option">
                                        <input type="radio" id="cronMinuteRange" name="cronMinute"/>
                                        <label htmlFor="cronMinuteRange">Every minute between minute 
                                        <select id="cronMinuteRangeStart" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                        and minute 
                                        <select id="cronMinuteRangeEnd" className="form-control-sm">
                                            <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                        </select>
                                        </label>
                                    </div>
                                </div>							
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="hours" title="Hours">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div className="cron-option">
                                <input type="radio" id="cronEveryHour" name="cronHour"/>
                                <label htmlFor="cronEveryHour">Every hour</label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronHourIncrement" name="cronHour"/>
                                <label htmlFor="cronHourIncrement">Every
                                    <select id="cronHourIncrementIncrement" className="form-control-sm">
                                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option>
                                    </select> hour(s) starting at hour 
                                    <select id="cronHourIncrementStart" className="form-control-sm">
                                        <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
                                    </select>
                                </label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronHourSpecific" defaultChecked={true} name="cronHour"/>
                                <label htmlFor="cronHourSpecific">Specific hour (choose one or many)</label>
                                <div className="cron-select-group">
                                    <div className="d-flex flex-wrap">
                                        {this.checkboxGroup(0, 23, "cronHourSpecificSpecific", "cronHour")}
                                    </div>
                                </div>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronHourRange" name="cronHour"/>
                                <label htmlFor="cronHourRange">Every hour between hour 
                                <select id="cronHourRangeStart" className="form-control-sm">
                                    <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
                                </select>
                                and hour 
                                <select id="cronHourRangeEnd" className="form-control-sm">
                                    <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
                                </select>
                                </label>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="day" title="Day">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div className="cron-option">
                                <input type="radio" id="cronEveryDay" name="cronDay" defaultChecked={true}/>
                                <label htmlFor="cronEveryDay">Every day</label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronDowIncrement" name="cronDay"/>
                                <label htmlFor="cronDowIncrement">Every
                                    <select id="cronDowIncrementIncrement" className="form-control-sm">
                                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option>
                                    </select> day(s) starting on 
                                    <select id="cronDowIncrementStart" className="form-control-sm">
                                        <option value="1">Sunday</option>
                                        <option value="2">Monday</option>
                                        <option value="3">Tuesday</option>
                                        <option value="4">Wednesday</option>
                                        <option value="5">Thursday</option>
                                        <option value="6">Friday</option>
                                        <option value="7">Saturday</option>
                                    </select>
                                </label>
                            </div>								
                            <div className="cron-option">
                            <input type="radio" id="cronDomIncrement" name="cronDay"/>
                            <label htmlFor="cronDomIncrement">Every
                                <select id="cronDomIncrementIncrement" className="form-control-sm">
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option>
                                </select> day(s) starting on the 
                                <select id="cronDomIncrementStart" className="form-control-sm">
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                    <option value="5">5th</option>
                                    <option value="6">6th</option>
                                    <option value="7">7th</option>
                                    <option value="8">8th</option>
                                    <option value="9">9th</option>
                                    <option value="10">10th</option>																						
                                    <option value="11">11th</option>
                                    <option value="12">12th</option>
                                    <option value="13">13th</option>
                                    <option value="14">14th</option>
                                    <option value="15">15th</option>
                                    <option value="16">16th</option>
                                    <option value="17">17th</option>
                                    <option value="18">18th</option>
                                    <option value="19">19th</option>
                                    <option value="20">20th</option>
                                    <option value="21">21st</option>
                                    <option value="22">22nd</option>
                                    <option value="23">23rd</option>
                                    <option value="24">24th</option>
                                    <option value="25">25th</option>
                                    <option value="26">26th</option>
                                    <option value="27">27th</option>
                                    <option value="28">28th</option>
                                    <option value="29">29th</option>
                                    <option value="30">30th</option>																						
                                    <option value="31">31st</option>
                                </select>
                                of the month
                            </label>
                        </div>
                            <div className="cron-option">
                                <input type="radio" id="cronDowSpecific" name="cronDay"/>
                                <label htmlFor="cronDowSpecific">Specific day of week (choose one or many)</label>
                                <div className="cron-select-group">
                                    <div className="d-flex flex-wrap">
                                        {this.listCheckboxGroup(dayOfWeekLabels, dayOfWeekValues, "cronDowSpecificSpecific", dayOfWeekIds)}
                                    </div>
                                </div>
                            </div>																
                            <div className="cron-option">
                                <input type="radio" id="cronDomSpecific" name="cronDay"/>
                                <label htmlFor="cronDomSpecific">Specific day of month (choose one or many)</label>
                                <div className="cron-select-group">
                                    <div className="d-flex flex-wrap">
                                        {this.checkboxGroup(0, 31, "cronDomSpecificSpecific", "cronDom")}
                                    </div>
                                </div>
                            </div>
                            <div className="cron-option">
                            <input type="radio" id="cronLastDayOfMonth" name="cronDay"/>
                            <label htmlFor="cronLastDayOfMonth">On the last day of the month</label>
                        </div>
                            <div className="cron-option">
                            <input type="radio" id="cronLastWeekdayOfMonth" name="cronDay"/>
                            <label htmlFor="cronLastWeekdayOfMonth">On the last weekday of the month</label>
                        </div>																							
                            <div className="cron-option">
                            <input type="radio" id="cronLastSpecificDom" name="cronDay"/>
                            <label htmlFor="cronLastSpecificDom">On the last 
                                <select id="cronLastSpecificDomDay" className="form-control-sm">
                                    <option value="1">Sunday</option>
                                    <option value="2">Monday</option>
                                    <option value="3">Tuesday</option>
                                    <option value="4">Wednesday</option>
                                    <option value="5">Thursday</option>
                                    <option value="6">Friday</option>
                                    <option value="7">Saturday</option>
                                </select>									
                                of the month
                            </label>
                        </div>	
                            <div className="cron-option">
                            <input type="radio" id="cronDaysBeforeEom" name="cronDay"/>
                            <label htmlFor="cronDaysBeforeEom">
                                <select id="cronDaysBeforeEomMinus" className="form-control-sm">
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option>
                                </select> day(s) before the end of the month
                            </label>
                        </div>
                            <div className="cron-option">
                            <input type="radio" id="cronNthDay" name="cronDay"/>
                            <label htmlFor="cronNthDay">
                                On the 
                                <select id="cronNthDayNth" className="form-control-sm">
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                    <option value="5">5th</option>
                                </select>
                                <select id="cronNthDayDay" className="form-control-sm">
                                    <option value="1">Sunday</option>
                                    <option value="2">Monday</option>
                                    <option value="3">Tuesday</option>
                                    <option value="4">Wednesday</option>
                                    <option value="5">Thursday</option>
                                    <option value="6">Friday</option>
                                    <option value="7">Saturday</option>
                                </select>										
                                of the month
                            </label>
                        </div>
                        </div>
                    </Tab>
                    <Tab eventKey="month" title="Month">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div className="cron-option">
                                <input type="radio" id="cronEveryMonth" name="cronMonth" defaultChecked={true}/>
                                <label htmlFor="cronEveryMonth">Every month</label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronMonthIncrement" name="cronMonth"/>
                                <label htmlFor="cronMonthIncrement">Every
                                    <select id="cronMonthIncrementIncrement" className="form-control-sm">
                                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>
                                    </select> month(s) starting in 
                                    <select id="cronMonthIncrementStart" className="form-control-sm">
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>																																	
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronMonthSpecific" name="cronMonth"/>
                                <label htmlFor="cronMonthSpecific">Specific month (choose one or many)</label>
                                <div className="cron-select-group">
                                    <div className="d-flex flex-wrap">
                                        {this.listCheckboxGroup(monthsLabels, monthsValues, "cronMonthSpecificSpecific", monthsIds)}
                                    </div>
                                </div>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronMonthRange" name="cronMonth"/>
                                <label htmlFor="cronMonthRange">
                                    Every month between 
                                    <select id="cronMonthRangeStart" className="form-control-sm">
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>																																	
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                    and 
                                    <select id="cronMonthRangeEnd" className="form-control-sm">
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>																																	
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </label>
                            </div>					
                        </div>
                    </Tab>
                    <Tab eventKey="year" title="Year">
                        <div className="crontabs-page" style={{padding: "0.8rem 0.8rem 0rem 0.8rem"}}>
                            <div className="cron-option">
                                <input type="radio" id="cronEveryYear" name="cronYear" defaultChecked={true}/>
                                <label htmlFor="cronEveryYear">Any year</label>
                            </div>
                            <div className="cron-option">
                                <input type="radio" id="cronYearIncrement" name="cronYear"/>
                                <label htmlFor="cronYearIncrement">Every
                                    <select id="cronYearIncrementIncrement" className="form-control-sm">
                                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option><option value="60">60</option><option value="61">61</option><option value="62">62</option><option value="63">63</option><option value="64">64</option><option value="65">65</option><option value="66">66</option><option value="67">67</option><option value="68">68</option><option value="69">69</option><option value="70">70</option><option value="71">71</option><option value="72">72</option><option value="73">73</option><option value="74">74</option><option value="75">75</option><option value="76">76</option><option value="77">77</option><option value="78">78</option><option value="79">79</option><option value="80">80</option><option value="81">81</option><option value="82">82</option><option value="83">83</option>
                                    </select> years(s) starting in 
                                    <select id="cronYearIncrementStart" className="form-control-sm">
                                        <option value="2016">2016</option><option value="2017">2017</option><option value="2018">2018</option><option value="2019">2019</option><option value="2020">2020</option><option value="2021">2021</option><option value="2022">2022</option><option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option><option value="2031">2031</option><option value="2032">2032</option><option value="2033">2033</option><option value="2034">2034</option><option value="2035">2035</option><option value="2036">2036</option><option value="2037">2037</option><option value="2038">2038</option><option value="2039">2039</option><option value="2040">2040</option><option value="2041">2041</option><option value="2042">2042</option><option value="2043">2043</option><option value="2044">2044</option><option value="2045">2045</option><option value="2046">2046</option><option value="2047">2047</option><option value="2048">2048</option><option value="2049">2049</option><option value="2050">2050</option><option value="2051">2051</option><option value="2052">2052</option><option value="2053">2053</option><option value="2054">2054</option><option value="2055">2055</option><option value="2056">2056</option><option value="2057">2057</option><option value="2058">2058</option><option value="2059">2059</option><option value="2060">2060</option><option value="2061">2061</option><option value="2062">2062</option><option value="2063">2063</option><option value="2064">2064</option><option value="2065">2065</option><option value="2066">2066</option><option value="2067">2067</option><option value="2068">2068</option><option value="2069">2069</option><option value="2070">2070</option><option value="2071">2071</option><option value="2072">2072</option><option value="2073">2073</option><option value="2074">2074</option><option value="2075">2075</option><option value="2076">2076</option><option value="2077">2077</option><option value="2078">2078</option><option value="2079">2079</option><option value="2080">2080</option><option value="2081">2081</option><option value="2082">2082</option><option value="2083">2083</option><option value="2084">2084</option><option value="2085">2085</option><option value="2086">2086</option><option value="2087">2087</option><option value="2088">2088</option><option value="2089">2089</option><option value="2090">2090</option><option value="2091">2091</option><option value="2092">2092</option><option value="2093">2093</option><option value="2094">2094</option><option value="2095">2095</option><option value="2096">2096</option><option value="2097">2097</option><option value="2098">2098</option><option value="2099">2099</option>
                                    </select>
                                </label>
                            </div>
                            <div className="cron-option">
                            <input type="radio" id="cronYearSpecific" name="cronYear"/>
                            <label htmlFor="cronYearSpecific">Specific year (choose one or many)</label>
                            <div className="cron-select-group">
                                <div className="d-flex flex-wrap">
                                    {this.checkboxGroup(2019, 2032, "cronYearSpecificSpecific", "cronYear")}
                                </div>
                            </div>
                        </div>
                            <div className="cron-option">
                                <input type="radio" id="cronYearRange" name="cronYear"/>
                                <label htmlFor="cronYearRange">
                                    Every year between 
                                    <select id="cronYearRangeStart" className="form-control-sm">
                                        <option value="2016">2016</option><option value="2017">2017</option><option value="2018">2018</option><option value="2019">2019</option><option value="2020">2020</option><option value="2021">2021</option><option value="2022">2022</option><option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option><option value="2031">2031</option><option value="2032">2032</option><option value="2033">2033</option><option value="2034">2034</option><option value="2035">2035</option><option value="2036">2036</option><option value="2037">2037</option><option value="2038">2038</option><option value="2039">2039</option><option value="2040">2040</option><option value="2041">2041</option><option value="2042">2042</option><option value="2043">2043</option><option value="2044">2044</option><option value="2045">2045</option><option value="2046">2046</option><option value="2047">2047</option><option value="2048">2048</option><option value="2049">2049</option><option value="2050">2050</option><option value="2051">2051</option><option value="2052">2052</option><option value="2053">2053</option><option value="2054">2054</option><option value="2055">2055</option><option value="2056">2056</option><option value="2057">2057</option><option value="2058">2058</option><option value="2059">2059</option><option value="2060">2060</option><option value="2061">2061</option><option value="2062">2062</option><option value="2063">2063</option><option value="2064">2064</option><option value="2065">2065</option><option value="2066">2066</option><option value="2067">2067</option><option value="2068">2068</option><option value="2069">2069</option><option value="2070">2070</option><option value="2071">2071</option><option value="2072">2072</option><option value="2073">2073</option><option value="2074">2074</option><option value="2075">2075</option><option value="2076">2076</option><option value="2077">2077</option><option value="2078">2078</option><option value="2079">2079</option><option value="2080">2080</option><option value="2081">2081</option><option value="2082">2082</option><option value="2083">2083</option><option value="2084">2084</option><option value="2085">2085</option><option value="2086">2086</option><option value="2087">2087</option><option value="2088">2088</option><option value="2089">2089</option><option value="2090">2090</option><option value="2091">2091</option><option value="2092">2092</option><option value="2093">2093</option><option value="2094">2094</option><option value="2095">2095</option><option value="2096">2096</option><option value="2097">2097</option><option value="2098">2098</option><option value="2099">2099</option>
                                    </select>
                                    and 
                                    <select id="cronYearRangeEnd" className="form-control-sm">
                                        <option value="2016">2016</option><option value="2017">2017</option><option value="2018">2018</option><option value="2019">2019</option><option value="2020">2020</option><option value="2021">2021</option><option value="2022">2022</option><option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option><option value="2031">2031</option><option value="2032">2032</option><option value="2033">2033</option><option value="2034">2034</option><option value="2035">2035</option><option value="2036">2036</option><option value="2037">2037</option><option value="2038">2038</option><option value="2039">2039</option><option value="2040">2040</option><option value="2041">2041</option><option value="2042">2042</option><option value="2043">2043</option><option value="2044">2044</option><option value="2045">2045</option><option value="2046">2046</option><option value="2047">2047</option><option value="2048">2048</option><option value="2049">2049</option><option value="2050">2050</option><option value="2051">2051</option><option value="2052">2052</option><option value="2053">2053</option><option value="2054">2054</option><option value="2055">2055</option><option value="2056">2056</option><option value="2057">2057</option><option value="2058">2058</option><option value="2059">2059</option><option value="2060">2060</option><option value="2061">2061</option><option value="2062">2062</option><option value="2063">2063</option><option value="2064">2064</option><option value="2065">2065</option><option value="2066">2066</option><option value="2067">2067</option><option value="2068">2068</option><option value="2069">2069</option><option value="2070">2070</option><option value="2071">2071</option><option value="2072">2072</option><option value="2073">2073</option><option value="2074">2074</option><option value="2075">2075</option><option value="2076">2076</option><option value="2077">2077</option><option value="2078">2078</option><option value="2079">2079</option><option value="2080">2080</option><option value="2081">2081</option><option value="2082">2082</option><option value="2083">2083</option><option value="2084">2084</option><option value="2085">2085</option><option value="2086">2086</option><option value="2087">2087</option><option value="2088">2088</option><option value="2089">2089</option><option value="2090">2090</option><option value="2091">2091</option><option value="2092">2092</option><option value="2093">2093</option><option value="2094">2094</option><option value="2095">2095</option><option value="2096">2096</option><option value="2097">2097</option><option value="2098">2098</option><option value="2099">2099</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}