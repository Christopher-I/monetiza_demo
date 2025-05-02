import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";

const AnimationWrapper = ({
    children,
    keyValue,
    initial = { opacity: 0 },
    animate = { opacity: 1 },
    transition = { duration: 3 },
    className,
}) => {
    console.log("AnimationWrapper rendered");

    return (
        <AnimatePresence>
            <motion.div
                key={keyValue}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

AnimationWrapper.propTypes = {
    children: PropTypes.node.isRequired, // Validates that children are passed and can be any renderable content.
    keyValue: PropTypes.string.isRequired, // Validates that keyValue is a required string.
    initial: PropTypes.object, // Validates that initial is an object.
    animate: PropTypes.object, // Validates that animate is an object.
    transition: PropTypes.object, // Validates that transition is an object.
    className: PropTypes.string, // Validates that className is a string (optional).
};

export default AnimationWrapper;
