import React,{useState,useEffect} from 'react'

/**
 * 分割线
 * @param {*} props 
 * @returns 
 */
const SplitLine = (props) => {

    SplitLine.defaultProps = {
        splitColor:'#1976d2'
    }
    
    /**
     * 设置是否隐藏分割条
     */
     const [opacity,setOpacity] = useState(props.hideSplit?0.0:0.9);
     const showColSplit = ()=>{
        setOpacity(0.9);
     };
     const hideColSplit = ()=>{
         if(props.hideSplit&&!mouseDown) setOpacity(0.0);
     }

     /**
     * 监测鼠标移动
     */
    const [mouseDown,isMouseDown] = useState(false);
    const onMouseDown = ()=>{ 
        document.addEventListener('mouseup',onMouseUp);
        isMouseDown(true);
    }
    const onMouseUp = ()=> {
        document.removeEventListener('mouseup',onMouseUp);
        hideColSplit();
        isMouseDown(false);
    }

    const mouseMoveEvent = (e)=>{
        props.updateSize(e,props.splitIndex);
        e.preventDefault();//防止鼠标移动时做到其它操作
        //window.getSelection ? window.getSelection().removeAllRanges() : document.getSelection().empty();
    }

    useEffect(() => {
        if (mouseDown) {
            document.addEventListener('mousemove',mouseMoveEvent);
        }
        return ()=>{
            document.removeEventListener('mousemove',mouseMoveEvent);
        }
    });

    const rowSplitStyle = {cursor:'n-resize',left:0,top: props.setSplitPosition(props.splitIndex,props.isRowSplit),width: '100%',height:props.splitWidth};
    const colSplitStyle = {cursor:'e-resize',top: 0,left:props.setSplitPosition(props.splitIndex,props.isRowSplit),height:'100%',width: props.splitWidth};

    return (
        <div style={{
                ...(props.isRowSplit?rowSplitStyle:colSplitStyle),
                zIndex:3,
                position: 'absolute',
                backgroundColor:props.splitColor,
                opacity:opacity,
            }} 
            onMouseOver={showColSplit} onMouseLeave={hideColSplit} 
            onMouseDown={onMouseDown} 
        />
    )
}

export default SplitLine;