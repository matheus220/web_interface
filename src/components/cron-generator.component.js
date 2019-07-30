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
            result: '0 0 * * *'
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
		var minutes = this.minutes();
		var hours = this.hours();
        var dom = day[0];
        var dow = day[1];
		var month = this.month();
        var result = minutes + ' ' + hours + ' ' + dom + ' ' + month + ' ' + dow;
        console.log(result)
        this._onChange(result);
        
        this.setState({
            result: result
        });
    }

    componentDidMount(){
        $('#crontabs input, #crontabs select').change(this.cronChange);
    }

    minutes() {
        var minutes = '';
		if ($('#cronEveryMinute:checked').length) {
			minutes = '*';
		} else if ($('#cronMinuteIncrement:checked').length) {
			minutes = '*';
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
			hours = '*';
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
			dom = '*';
		} else if ($('#cronDowIncrement:checked').length) {
			dow = '*';
			dow += '/';
			dow += $('#cronDowIncrementIncrement').val();
			dom = '*';
		} else if ($('#cronDomIncrement:checked').length) {
			dom = '*';
			dom += '/';
			dom += $('#cronDomIncrementIncrement').val();
			dow = '*';
		} else if ($('#cronDowSpecific:checked').length) {
			dom = '*';
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
			dow = '*';
			$('[name="cronDomSpecificSpecific"]:checked').each(function (i, chck) {
				dom += $(chck).val();
				dom += ',';
			});
			if (dom === '') {
				dom = '1';
			} else {
				dom = dom.slice(0, -1);
			}
		} else if ($('#cronNthDay:checked').length) {
			dom = '*';
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
			month = '*';
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
                <Tabs defaultActiveKey="minutes" id="uncontrolled-tab-example">
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
                                        </select> minute(s)
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
                                    </select> hour(s)
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
                                    </select> day(s)
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
                                        {this.checkboxGroup(1, 31, "cronDomSpecificSpecific", "cronDom")}
                                    </div>
                                </div>
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
                                    </select> month(s)
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
                </Tabs>
            </div>
        );
    }
}