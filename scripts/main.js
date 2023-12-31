function tree_add_tracks(ul, tracks) {
    var wasAdded = false;

    tracks.forEach(track => {
        var li = document.createElement("li");
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = true;

        ul.appendChild(li);

        if (track.tracks.length != 0) {
            var details = document.createElement("details");
            var summary = document.createElement("summary");

            summary.appendChild(checkbox);
            summary.appendChild(document.createTextNode(track.name));

            details.appendChild(summary);
            li.appendChild(details);

            var new_ul = document.createElement("ul");
            details.appendChild(new_ul);

            tree_add_tracks(new_ul, track.tracks);

            wasAdded = true;
        } else if (track.keyframes.Keyframes.length != 1) {
            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(track.name));

            wasAdded = true;
        } else {
            var mainChannel = track.keyframes.Keyframes[0].Channels[0];
            
            if ("EmbeddedAnimCurve" in mainChannel
            && mainChannel.EmbeddedAnimCurve != undefined) {
                li.appendChild(checkbox);
                li.appendChild(document.createTextNode(track.name));
            } else {
                li.remove();
                wasAdded = false;
            }
        }
    });

    if (!wasAdded) {
        //ul.parentNode.remove();
        //ul.remove();
    }
}

function tracks_reverse(tracks, sequence_length) {
    tracks.forEach(track => {
        if (track.keyframes.Keyframes.length == 1) {
            var mainChannel = track.keyframes.Keyframes[0].Channels[0];

            if ("EmbeddedAnimCurve" in mainChannel
            && mainChannel.EmbeddedAnimCurve != undefined) {
                animcurve_reverse(track, mainChannel.EmbeddedAnimCurve);
            }
        } else {
            track_reverse(track, sequence_length);
        }

        tracks_reverse(track.tracks, sequence_length);
    });
}

function track_reverse(track, sequence_length) {
    track_back_render(context_input, track, track_order * track_size, track_size);
    track_keyframes_render(context_input, track.keyframes.Keyframes, track_order, sequence_length);

    track.keyframes.Keyframes.reverse();

    track.keyframes.Keyframes.forEach(keyframe => {
        keyframe.Key = sequence_length - keyframe.Key;
    });

    track_back_render(context_output, track, track_order * track_size, track_size);
    track_keyframes_render(context_output, track.keyframes.Keyframes, track_order, sequence_length);

    track_order++;
}

function animcurve_reverse(track, animcurve) {
    track_back_render(context_input, track, track_order * track_size, track_size * 2);
    track_back_render(context_output, track, track_order * track_size, track_size * 2);

    animcurve.channels.forEach(animcurve_channel => {
        track_animcurve_render(context_input, animcurve_channel, track_order, false);

        animcurve_channel_reverse(animcurve_channel);
        track_animcurve_render(context_output, animcurve_channel, track_order, false);
    });

    track_order += 2;
}

function track_back_render(context, track, y, size) {
    const width = context.canvas.width;

    var color = gmColorToRgba(track.trackColour);

    context.beginPath();
    context.strokeStyle = rgbaToCss(color);
    context.lineWidth = 0.5;

    color.a *= 0.25;
    context.fillStyle = rgbaToCss(color);

    context.rect(0, y, width, size);
    
    context.stroke();
    context.fill();
}

function track_keyframes_render(context, keyframes, order, sequence_length) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    context.strokeStyle = "#000";
    context.fillStyle = "#FFF";

    keyframes.forEach(keyframe => {
        var x = (keyframe.Key / sequence_length) * (width - track_margin * 2) + track_margin;
        var y = order * track_size + track_size * 0.5;
        var size = 4;

        context.beginPath();

        //context.arc((keyframe.Key / sequence_length) * (width - track_margin * 2) + track_margin, order * track_size + track_size * 0.5, 4, 0, 2 * Math.PI);

        context.moveTo(x, y - size);
        context.lineTo(x + size, y);
        context.lineTo(x, y + size);
        context.lineTo(x - size, y);

        context.closePath();
    
        context.stroke();
        context.fill();
    });
}

function track_animcurve_render(context, animcurve_channel, order) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    animcurve_channel_render(context, animcurve_channel, track_margin, order * track_size + track_margin, width - track_margin * 2, track_size * 2 - track_margin * 2);
}

function pre_render(context) {
    const width = context.canvas.clientWidth;
    const height = context.canvas.clientHeight;

    console.log(context.canvas.clientWidth);
    
    context.canvas.width = width;
    context.canvas.height = height;

    context.clearRect(0, 0, width, height);
}

function gmColorToRgba(number) {
    const a = (number >>> 24) / 255;
    const b = (number & 0x00ff0000) >>> 16;
    const g = (number & 0x0000ff00) >>> 8;
    const r = number & 0x000000ff;

    return { r, g, b, a };
}

function rgbaToCss(color) {
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}