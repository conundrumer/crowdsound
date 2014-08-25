define(['react'], function(React) {

    var CommentBox = {
        render: function(node){
            React.renderComponent(CommentContainer(), node);
        },
        clear: null,
        onStart: null,
        onEnd: null
    };

    var CommentContainer = React.createClass({
        getInitialState: function() {
            return {
                comments: []
            };
        },
        componentDidMount: function() {
            CommentBox.clear = this.clear;
            CommentBox.onStart = this.addComment;
            CommentBox.onEnd = this.removeComment;
        },
        clear: function() {
            this.setState({comments: [] });
        },
        addComment: function(comment) {
            comment.size = Math.round(40*Math.pow(comment.body.length, -0.3)) + 8;
            this.state.comments.unshift(comment);
            this.setState({comments: this.state.comments});
        },
        removeComment: function(comment) {
            if (!this.refs[comment.id]) return;
            this.refs[comment.id].remove(this.onRemoveComment.bind(this, comment));
        },
        onRemoveComment: function(comment) {
            var i = this.state.comments.indexOf(comment);
            if (i === -1) return;
            this.state.comments.splice(i, 1);
            this.setState({comments: this.state.comments});
        },
        render: function() {
            return React.DOM.div({
                className: 'comment-container'
            }, this.state.comments.map(function(comment){
                return Comment({ref: comment.id, key: comment.id, comment: comment});
            }));
        }
    });

    var Comment = React.createClass({
        getInitialState: function() {
            return {
                minimized: true
            };
        },
        maximize: function() {
            this.setState({minimized: false});
        },
        componentDidMount: function() {
            setTimeout(this.maximize, 20);
        },
        remove: function(onRemove) {
            this.refs.box.getDOMNode().addEventListener('transitionend', onRemove);
            this.setState({minimized: true});
        },
        render: function() {
            return React.DOM.div({
                ref: 'box',
                className: 'c ' +
                    (this.state.minimized ? 'minimized' : '') +
                    (this.props.comment.size < 25 ? ' multiline': ''),
                style: {"font-size": this.props.comment.size}
            }, this.props.comment.body);
        }
    });

    return CommentBox;
});
