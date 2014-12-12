/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');
// var ReactStyle = require('react-style');
// require('./../../styles/right-container.css');
require('./../../node_modules/react-tabs/lib/styles.css');
// react tabs
var ReactTabs    = require('react-tabs');
var Tabs = ReactTabs.Tabs;
var Tab = ReactTabs.Tab;
var TabPanel = ReactTabs.TabPanel;
var TabList = ReactTabs.TabList;
var uidata = require('./../js/uidata.js');
var mui = require('material-ui');
var Menu = require('./menu.jsx');

var supportedStyles = [
        {
            name: 'Width',
            cssProperty: 'width',
            inputType: 'text'
        },
        {
            name: 'Height',
            cssProperty: 'height',
            inputType: 'text'
        },
        {
            name: 'Background',
            cssProperty: 'background',
            inputType: 'text'
        },
        {
            name: 'Font',
            cssProperty: 'font',
            inputType: 'text'
        },
        {
            name: 'Color',
            cssProperty: 'color',
            inputType: 'text'
        },
        {
            name: 'Border',
            cssProperty: 'border',
            inputType: 'text'
        },
    ];

// TODO - put the JSON.stringify and JSON.parse calls in try catch blocks
// TODO - put new Function call in try catch block
var RightContainer = React.createClass({
    getInitialState: function() {
        return {
            selectedComponent: this.props.selectedComponent
        };
    },
    componentDidUpdate: function(prevProps, prevState) {
        if(!_.isEqual(this.state.selectedComponent.name, this.props.selectedComponent.name)) {
            var self = this;
            this.setState({selectedComponent: this.props.selectedComponent}, function() {
                self.clearStyleInputs();
            })
        }
    },
    getDefaultProps: () => { componentList: {} },
    clearStyleInputs: function() {
        var i = 0;
        while(this.refs['style_input_'+i]) {
            console.log('got it');
            this.refs['style_input_'+i].getDOMNode().value = '';
            i++;
        }
    },
    handleStyleInputBlur: function(style, event) {
        if(typeof this.props.onStyleChange === 'function') {
            // var newStyle = _.reduce(this.props.selectedComponent.supportedStyles, function(acc, supportedStyle) {
            //     acc[supportedStyle] = this.refs['style'+supportedStyle].getDOMNode().value;
            //     return acc;
            // }, {}, this);
            this.props.onStyleChange(style, event.target.value);
        }
    },
    getPropType: function(propName) {
        return uidata[this.props.selectedComponent.name].comp.propTypes[propName];
    },
    // TODO - handle the case where the changed props was not in the initial list of props but in propTypes of the component
    // TODO - sometimes the JSON parsing fails. Check why
    handlePropChange: function(e) {
        if(typeof this.props.onPropsChange === 'function') {
            // debugger;
            var propsObj = this.props.selectedComponent.props;
            if(this.props.selectedComponent.name && uidata[this.props.selectedComponent.name].comp.propTypes) {
                propsObj = uidata[this.props.selectedComponent.name].comp.propTypes;
            }

            var newProps = _.reduce(propsObj, function(acc, propValue, propName) {
                if(propValue == React.PropTypes.func) {
                    acc[propName] = new Function(this.refs['prop'+propName].getDOMNode().value);
                } else {
                    acc[propName] = JSON.parse(this.refs['prop'+propName].getDOMNode().value);
                }
                return acc;
            }, {}, this);

            this.props.onPropsChange(newProps);
        }
    },
    render: function() {

        var index = 0;
        var self = this;
        var style = {
            padding: 20,
            minHeight: 700
        };

        var styleInputs = _.map(supportedStyles, function(supportedStyle, index) {
            return (
                <div className='pure-u-1'>
                    <label>{supportedStyle.name} : </label>
                    <input 
                        ref={'style_input_' + index}
                        defaultValue={this.props.selectedComponent.props.style ? this.props.selectedComponent.props.style[supportedStyle.cssProperty] :''}
                        onBlur={this.handleStyleInputBlur.bind(this, supportedStyle)}
                        key={'style_input_'+index}
                        type={supportedStyle.inputType}
                        className='pure-input-u-1-2'
                        />
                </div>
            )
        }, this);

// TODO - instead use the components propTypes property to know all the supported properties
// filter out the properties which talk about functions. or Not?
        // the properties tab
        var propDivIndex = 0;
        var properties = '';
        if(this.props.selectedComponent.name) {
            if(uidata[this.props.selectedComponent.name].comp.propTypes) {
                properties = _.map(uidata[this.props.selectedComponent.name].comp.propTypes, function(value, key) {
                    propDivIndex++;
                    var propValue = this.props.selectedComponent.props[key] || '';
                    var propName = key;
                    var propType = 'indeterminate';
                    var valueToShow = JSON.stringify(propValue);

                    switch(value) {
                        case React.PropTypes.func:
                            propType = 'function';
                            // IMPORTANT - tricky business allowing people to input functions as strings.
                            var functionString = propValue.toString();
                            propValue = functionString.substring(functionString.indexOf("{") + 1, functionString.lastIndexOf("}"));
                            valueToShow = propValue;
                            break;
                        case React.PropTypes.string:
                        case React.PropTypes.string.isRequired:
                            propType = 'string';
                            break;
                        case React.PropTypes.number:
                        case React.PropTypes.number.isRequired:
                            propType = 'number';
                            valueToShow = JSON.stringify(propValue || 0);
                            break;
                        case React.PropTypes.array:
                        case React.PropTypes.array.isRequired:
                            propType = 'array';
                            break;
                        case React.PropTypes.bool:
                            propType = 'boolean';
                            valueToShow = JSON.stringify(propValue || false); // very very IMPORTANT. this thing solved the whole how to pass string as boolean to prop problem
                            break;
                        default:
                            propType = 'indeterminate';
                    }

                    return (
                        <div className='pure-u-1' key={'prop_div_'+propDivIndex}>
                            <label>{propName+' ( ' + propType + ' ): '}</label>
                            <input
                                className='pure-input-1'
                                type='text'
                                value={valueToShow}
                                ref={'prop'+propName}
                                onChange={this.handlePropChange}
                                disabled={propName === 'className'}
                                ></input>
                        </div>
                    );

                }, this);
            } else { // for components who have not defined proptypes
                var properties = _.map(this.props.selectedComponent.props, function(propValue, propName) {
                    propDivIndex++;
                    return (
                        <div className='pure-u-1' key={'prop_div_'+propDivIndex}>
                            <label>{propName+': '}</label>
                            <input
                                className='pure-input-1'
                                type='text'
                                value={JSON.stringify(propValue)}
                                ref={'prop'+propName}
                                onChange={this.handlePropChange}
                                ></input>
                        </div>
                    );
                }, this);
            }
        }


        // the tab panels for components to be dragged and dropped
        var tabPanelIndex = 0;
        var componentViews = _.map(this.props.componentList, function(componentItems, componentType) {
            tabPanelIndex++;
            return (
                <TabPanel
                    key={'tab_panel_no_'+tabPanelIndex}>
                    <Menu
                        key={"component_menu_"+Math.random()}
                        items={componentItems}
                    />
                </TabPanel>
            );
        });

        var tabIndex = 0;
        var tabs = _.map(this.props.componentList, function(componentItems, componentType) {
            tabIndex++;
            return (
                <Tab
                    key={'tab_no_'+tabIndex}
                    >
                    {componentType.charAt(0).toUpperCase()+_.rest(componentType).join('')}
                </Tab>
            );
        }); //.toJS();


        return (
            <div style={style} className="pure-u-4-24 right-container">
                <div className="right-container-top" style={{minHeight:200, marginBottom: 10}}>
                    <Tabs
                        onSelect={this.handleTopMenuSelected}
                        selectedIndex={0}
                    >
                        <TabList>
                            <Tab>Properties</Tab>
                            <Tab>Styles</Tab>
                        </TabList>
                        <TabPanel>
                            <form className="pure-form pure-g">
                                {properties}
                            </form>
                        </TabPanel>
                        <TabPanel>
                            <form className='pure-form pure-g'>
                                {styleInputs}
                            </form>
                        </TabPanel>
                    </Tabs>
                </div>
                <Tabs
                onSelect={this.handleSelected}
                selectedIndex={0}>
                    <TabList>
                        {tabs}
                    </TabList>
                    {componentViews}
                </Tabs>
                {componentViews}
            </div>
        );
    }

});

module.exports = RightContainer;