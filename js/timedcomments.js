/**
 * Stores and schedules comments
 */
define(function() {
    function TimedComments() {
        this.comments = [];
        this.position = 0;
        this.time = 0; //this.time: ms
        this.skipped = false;
    }

    TimedComments.prototype = {
        get currentComment() {
            if (this.comments.length === 0) {
                return {body: "", time: -1, id: -1};
            }
            return this.comments[this.position];
        },
        addComments: function(comments) {
            comments = formatComments(comments);
            var offset = 0;
            while (compareComments(comments[offset], this.currentComment) < 0) {
                offset++;
            }
            this.position += offset;
            this.comments = this.comments.concat(comments).sort(compareComments);

        },
        advance: function (time, lookahead, commentCallback) {
            var oldTime = time;
            if (this.skipped) {
                // console.log("skipped to " + time);
                this.position = 0;
            } else {
                time += lookahead;
            }
            while (this.position < this.comments.length && this.currentComment.time < time) {
                if (!this.skipped) {
                    var delay = this.currentComment.time - this.time;
                    // this.currentComment.timeToInvoke = Date.now() + delay;
                    commentCallback(this.currentComment, delay);
                }
                this.position++;
            }
            // console.log("Actual: " + Math.round(oldTime),
            //     "Current: " + Math.round(this.time),
            //     "Next: " + Math.round(time));
            this.time = time;
            this.skipped = false;
        }
    };

    function formatComments (comments) {
        return comments.map(function (comment) {
            return {
                body: comment.body,
                time: comment.timestamp,
                id: comment.id
                };
            }).filter(function (comment) {
                    return comment.time !== null && comment.time >= 0;
            }).sort(compareComments);
    }

    function compareComments (a, b) {
        if (a.time === b.time) {
            return a.id - b.id;
        } else {
            return a.time - b.time;
        }
    }

    return TimedComments;
});