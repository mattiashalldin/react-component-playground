/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var _ = require('lodash');

var Menu = React.createClass({
    getDefaultProps() {
        return {
            items: ["Home", "Flickr", "Messenger", "Sports", "Finance"],
            selectedItem: "Messenger",
            vertical: true
        };
    },
    handleDragStart(item, event) {
        event.dataTransfer.setData('text', item);
        // this.props.onItemDragStart(item);
    },
    handleDragEnd(event) {
        console.log('drag ended');
        if(_.isFunction(this.props.handleDragEnd)) this.props.handleDragEnd(event);
    },
    render() {
        var cx = React.addons.classSet;
        var classes = cx({
            "pure-menu": true,
            "pure-menu-open": true,
            "pure-menu-horizontal": !this.props.vertical || this.props.horizontal
        });

        var menuHeading = (
            <a className="pure-menu-heading">{this.props.heading}</a>
        );

        var menuItems = this.props.items.map(function(item, index) {
            return (
                <li 
                    draggable="true"
                    key={"item_no_"+index} 
                    className={this.props.selectedItem===item?"pure-menu-selected":""}
                    onDragStart={this.handleDragStart.bind(this,item)}
                    onDragEnd={this.handleDragEnd}
                >
                    <a href="#">{item}</a>
                </li>
            );
        }, this);

        return (
            <div className={classes}>
                {this.props.heading ? menuHeading : ''}
                <ul>
                    {menuItems}
                </ul>
                {this.props.children}
            </div>
        );
    }

});

module.exports = Menu;